import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";
import { JwtService } from "@nestjs/jwt";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GameResultDto } from "src/game/dto/create-game.dto";
import { GameService } from "src/game/game.service";
import * as bcrypt from "bcrypt";
import { env } from "process";

@Injectable()
export class GatewayService {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly gameService: GameService,
    private readonly jwtService: JwtService
  ) {}

  gameRooms: Map<string, DTO.gameStateDataI> = new Map();
  connections: Map<string, DTO.ClientInfo> = new Map();
  readyToPlayUsers: DTO.ClientInfo[] = [];
  server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  async connectUser(socket: Socket): Promise<boolean> {
    let authName = socket.handshake.auth.username;
    const authorizedUser = await this.getUserFromJWT(
      socket.handshake.auth.token
    );
    if (authorizedUser || authName) {
      if (authorizedUser) {
        this.connections.set(socket.id, {
          id: authorizedUser.id,
          name: authorizedUser.name,
          socketId: socket.id,
          inGame: false,
        });
      } else if (authName) {
        const user = await this.userService.getUserByName(authName);
        if (!user) return false;
        this.connections.set(socket.id, {
          id: user.id,
          name: user.name,
          socketId: socket.id,
          inGame: false,
        });
      }
      // set user status online
      this.userService.setUserStatus(
        this.connections.get(socket.id).id,
        "ONLINE"
      );
      //send to new user all channels
      this.server
        .to(socket.id)
        .emit("channels", await this.channelService.ChannelList());

      //connect user to his channels
      this.connectUserToChannels(socket);
      this.connectUserToGames(socket.id);
      return true;
    }
    this.server.emit("connectError", { message: "invalid username" });
    return false;
  }

  async disconnectUser(socket: Socket) {
    this.userService
      .setUserStatus(this.connections.get(socket.id).id, "OFFLINE")
      .then((user) => {
        user.channels.forEach((channel) => {
          this.server.to(channel.name).emit("userDisconnected", {
            channelName: channel.name,
            userName: user.name,
          });
        });
      })
      .catch((e) => console.log(e.message));
    this.readyToPlayUsers = this.readyToPlayUsers.filter(
      (user) => user.name != this.connections.get(socket.id)?.name
    );
    for (const el of this.gameRooms.values()) {
      if (
        el.playerFirst.name == this.connections.get(socket.id).name ||
        el.playerSecond.name == this.connections.get(socket.id).name
      )
        this.server.to(el.gameName).emit("rivalOnline", { isOnline: false });
    }
    this.connections.delete(socket.id);
  }

  async connectToChannelPM(socket: Socket, data: DTO.ManageUserI) {
    try {
      const targetUser = await this.userService.getUserByName(
        data.targetUserName
      );
      const executor = await this.userService.getUser(
        this.connections.get(socket.id)?.id || -1
      );
      if (!targetUser || !executor)
        this.emitExecutionError(socket.id, "privateMessage", "user unknown");
      else if (targetUser.name == executor.name)
        this.emitNotAllowed(
          socket.id,
          "privateMessage",
          data,
          "self-talks are strange"
        );
      else if (targetUser.bannedIds.includes(executor.id))
        this.emitNotAllowed(socket.id, "privateMessage", data, "you're banned");
      else if (executor.bannedIds.includes(targetUser.id))
        this.emitNotAllowed(socket.id, "privateMessage", data, "user is banned");
      else {
        const channelIn = this.createPMChannelInfo([
          executor.name,
          data.targetUserName,
        ]);
        await this.connectUserToChannel(channelIn, executor);
        this.connectUserToChannel(channelIn, targetUser);
      }
    } catch (e) {
      this.emitExecutionError(socket.id, "privateMessage", e.cause);
    }
  }

  async newMessage(socket: Socket, message: CreateMessageDTO) {
    message.authorName = this.connections.get(socket.id).name;
    return this.channelService
      .addMessage(this.connections.get(socket.id).id, message)
      .then((messageOut) => {
        this.server.to(message.channelName).emit("newMessage", messageOut);
      })
      .catch((e: ForbiddenException) =>
        this.emitNotAllowed(socket.id, "newMessage", message, "you're muted")
      )
      .catch((e: NotFoundException) =>
        this.emitNotAllowed(socket.id, "newMessage", message, "channel unknown")
      )
      .catch((e) => this.emitExecutionError(socket.id, "newMessage", e.cause));
  }

  async addAdmin(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then((targetUser) => {
        this.channelService
          .addAdmin(
            this.connections.get(socketId)?.id || -1,
            data.channelName,
            targetUser.id
          )
          .then((isAdded) => {
            if (isAdded)
              this.server.to(data.channelName).emit("newAdmin", data);
          })
          .catch((e: ForbiddenException) =>
            this.emitNotAllowed(socketId, "addAdmin", data)
          )
          .catch((e) => this.emitExecutionError(socketId, "addAdmin", e.cause));
      })
      .catch((e) => this.emitExecutionError(socketId, "addAdmin", e.cause));
  }

  async changeChannelName(socketId: string, data: DTO.ChangeChannelNameI) {
    this.channelService
      .changeChannelName(this.connections.get(socketId)?.id || -1, data)
      .then((isChanged) => {
        if (isChanged) {
          this.server.in(data.channelName).socketsJoin(data.newName);
          this.server.socketsLeave(data.channelName);
          this.server.to(data.newName).emit("newChannelName", data);
        } else this.emitNotAllowed(socketId, "newChannelName", data);
      })
      .catch((e) =>
        this.emitExecutionError(socketId, "newChannelName", e.cause)
      );
  }

  async setPrivacy(socketId: string, data: DTO.SetPrivacyI) {
    this.channelService
      .setPrivacy(this.connections.get(socketId)?.id || -1, data)
      .then((isSet) => {
        if (isSet) this.server.to(data.channelName).emit("privacySet", data);
        else this.emitNotAllowed(socketId, "setPrivacy", data);
      })
      .catch((e) => this.emitExecutionError(socketId, "setPrivacy", e.cause));
  }

  async setPassword(socketId: string, data: DTO.SetPasswordI) {
    this.channelService
      .setPassword(this.connections.get(socketId)?.id || -1, data)
      .then((isSet) => {
        if (isSet) this.server.to(data.channelName).emit("passwordSet", data);
        else this.emitNotAllowed(socketId, "setPassword", data);
      })
      .catch((e) => this.emitExecutionError(socketId, "setPassword", e.cause));
  }

  async banUser(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then((targetUser) => {
        this.channelService
          .banUser(
            this.connections.get(socketId)?.id || -1,
            data.channelName,
            targetUser.id
          )
          .then((isBanned: boolean) => {
            if (isBanned) {
              this.leaveChannel(socketId, data.channelName, targetUser);
              this.server.to(socketId).emit("userBanned", data);
            } else this.emitNotAllowed(socketId, "banUser", data);
          })
          .catch((e) => this.emitExecutionError(socketId, "banUser", e.cause));
      })
      .catch((e) => this.emitExecutionError(socketId, "banUser", e.cause));
  }

  async muteUser(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then((targetUser) => {
        this.channelService
          .muteUser(
            this.connections.get(socketId)?.id || -1,
            data.channelName,
            targetUser.id
          )
          .then((isMuted) => {
            if (isMuted) this.server.to(socketId).emit("userMuted", data);
            else this.emitNotAllowed(socketId, "muteUser", data);
          })
          .catch((e) => this.emitExecutionError(socketId, "muteUser", e.cause));
      })
      .catch((e) => this.emitExecutionError(socketId, "muteUser", e.cause));
  }

  async unmuteUser(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then((targetUser) => {
        this.channelService
          .unmuteUser(
            this.connections.get(socketId)?.id || -1,
            data.channelName,
            targetUser.id
          )
          .then((isUnmuted) => {
            if (isUnmuted) this.server.to(socketId).emit("userUnmuted", data);
            else this.emitNotAllowed(socketId, "unmuteUser", data);
          })
          .catch((e) =>
            this.emitExecutionError(socketId, "unmuteUser", e.cause)
          );
      })
      .catch((e) => this.emitExecutionError(socketId, "muteUser", e.cause));
  }

  async unbanUser(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then((targetUser) => {
        this.channelService
          .unbanUser(
            this.connections.get(socketId)?.id || -1,
            data.channelName,
            targetUser.id
          )
          .then((isUnbanned) => {
            if (isUnbanned) this.server.to(socketId).emit("userUnbanned", data);
            else this.emitNotAllowed(socketId, "unbanUser", data);
          })
          .catch((e) =>
            this.emitExecutionError(socketId, "unbanUser", e.cause)
          );
      })
      .catch((e) => this.emitExecutionError(socketId, "unbanUser", e.cause));
  }

  async kickUser(socketId: string, data: DTO.ManageUserInChannelI) {
    this.channelService
      .getChannel(data.channelName)
      .then((channel) => {
        if (!channel)
          this.emitExecutionError(socketId, "kickUser", "channel unknown");
        if (channel.admIds.includes(this.connections.get(socketId)?.id || -1)) {
          this.userService
            .getUserByName(data.targetUserName)
            .then((targetUser) => {
              if (!targetUser)
                this.emitExecutionError(socketId, "kickUser", "user unknown");
              else
                this.leaveChannel(socketId, data.channelName, targetUser).then(
                  () => {
                    this.server
                      .to(socketId)
                      .emit("userKicked", data.channelName);
                  }
                );
            })
            .catch((e) =>
              this.emitExecutionError(socketId, "kickUser", e.cause)
            );
        } else this.emitNotAllowed(socketId, "kickUser", data);
      })
      .catch((e) => this.emitExecutionError(socketId, "kickUser", e.cause));
  }

  async joinChannel(socketId: string, channelIn: DTO.ChannelInfoIn) {
    const user = this.connections.get(socketId);
    const channel = await this.channelService.getChannel(channelIn.name);
    // check possibility
    if (!user) this.emitExecutionError(socketId, "joinChannel", "user unknown");
    else if (!channel)
      this.emitExecutionError(socketId, "joinChannel", "channel unknown");
    else if (await this.canJoin(socketId, user, channel, channelIn, user)) {
      await this.connectUserToChannel(
        channelIn,
        this.connections.get(socketId)
      ).catch((e) => this.emitExecutionError(socketId, "joinChannel", e.cause));

      // i suppose, we don't need this part of function
      if (channelIn.users) {
        channelIn.users.forEach(async (userName) => {
          const targetUser = await this.userService.getUserByName(
            userName.name
          );
          if (!targetUser)
            this.emitExecutionError(
              socketId,
              "connectToChannel",
              "user unknown"
            );
          else if (
            await this.canJoin(socketId, user, channel, channelIn, targetUser)
          )
            this.connectUserToChannel(channelIn, targetUser);
        });
      }
    }
  }

  async leaveChannel(
    socketId: string,
    channelName: string,
    user: DTO.ClientInfo = this.connections.get(socketId)
  ) {
    if (!user)
      this.emitExecutionError(socketId, "leaveChannel", "user unknown");
    this.channelService
      .leaveChannel(user.id, channelName)
      .catch((e) => this.emitExecutionError(socketId, "leaveChannel", e.cause))
      .then(() => {
        this.server.to(user.socketId).emit("leftChannel", channelName);
        this.server.in(user.socketId).socketsLeave(channelName);
        this.server.to(channelName).emit("userLeft", {
          channelName: channelName,
          userName: user.name,
          userId: user.id,
        });
      });
  }

  async addFriend(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .addFriend(this.connections.get(socketId)?.id || -1, data.targetUserName)
      .then((newFriend) => {
        if (newFriend) this.server.to(socketId).emit("newFriend", newFriend);
      })
      .catch((e: NotFoundException) =>
        this.emitExecutionError(socketId, "addFriend", "user unknown")
      )
      .catch((e: ForbiddenException) =>
        this.emitNotAllowed(socketId, "addFriend", "you're banned")
      )
      .catch((e) => this.emitExecutionError(socketId, "addFriend", e.cause));
  }

  removeFriend(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .removeFriend(
        this.connections.get(socketId)?.id || -1,
        data.targetUserName
      )
      .then((exFriend) => {
        if (exFriend) this.server.to(socketId).emit("exFriend", exFriend);
      })
      .catch((e: NotFoundException) => {
        this.emitExecutionError(socketId, "removeFriend", "user unknown");
      })
      .catch((e) => {
        this.emitExecutionError(socketId, "removeFriend", e.cause);
      });
  }

  async getFriends(socketId: string) {
    const user = this.connections.get(socketId);
    if (!user) return;
    await this.userService
      .getFriends(user.id)
      .then((friendList) => {
        this.server.to(socketId).emit("friendList", friendList);
      })
      .catch((e: NotFoundException) =>
        this.emitExecutionError(socketId, "friendList", "user unknown")
      )
      .catch((e) => this.emitExecutionError(socketId, "friendList", e.cause));
  }

  async banPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .banPersonally(
        this.connections.get(socketId)?.id || -1,
        data.targetUserName
      )
      .then((banned) => {
        if (banned) {
          this.server.to(socketId).emit("newPersonnalyBanned", banned);
          this.leavePMChannels(socketId, banned);
        } else this.emitNotAllowed(socketId, "banPersonnaly", data);
      })
      .catch((e: NotFoundException) =>
        this.emitExecutionError(socketId, "banPersonnaly", "user unknown")
      )
      .catch((e) =>
        this.emitExecutionError(socketId, "banPersonnaly", e.cause)
      );
  }

  async unbanPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .unbanPersonally(
        this.connections.get(socketId)?.id || -1,
        data.targetUserName
      )
      .then((exBanned) => {
        if (exBanned)
          this.server.to(socketId).emit("exPersonnalyBanned", exBanned);
        else this.emitNotAllowed(socketId, "unbanPersonally", data);
      })
      .catch((e: NotFoundException) =>
        this.emitExecutionError(socketId, "unbanPersonally", "user unknown")
      )
      .catch((e) =>
        this.emitExecutionError(socketId, "unbanPersonally", e.cause)
      );
  }

  async getPersonallyBanned(socketId: string) {
    const temp = this.connections.get(socketId);
    if (!temp) return;
    this.userService
      .getPersonallyBanned(temp.id)
      .then((bannedList) => {
        this.server.to(socketId).emit("personallyBannedList", bannedList);
      })
      .catch((e: NotFoundException) =>
        this.emitExecutionError(
          socketId,
          "personallyBannedList",
          "user unknown"
        )
      )
      .catch((e) =>
        this.emitExecutionError(socketId, "personallyBannedList", e.cause)
      );
  }

  async startGame(socket: Socket, data: DTO.AcceptInviteI) {
    const acceptorName = this.connections.get(socket.id)?.name || null;
    if (!acceptorName)
      this.emitExecutionError(socket.id, "startGame", "user unknown");
    else {
      const game: DTO.gameStateDataI = {
        gameName: data.sender + acceptorName + "Game",
        playerFirst: { name: data.sender, score: 0, paddleY: 0 },
        playerSecond: { name: acceptorName, score: 0, paddleY: 0 },
        ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
        isPaused: false,
      };
      this.connectToGame(game);
    }
  }

  async gameLine(socket: Socket, data: DTO.gameLineI) {
    if (data.inLine) {
      this.getInLine(socket);
    } else {
      this.leaveLine(socket);
    }
  }

  async inviteToGame(socket: Socket, data: DTO.InviteToGameI) {
    const executor = this.connections.get(socket.id);
    const recipientSocket = this.connectionByName(data.recipient);
    if (!executor)
      this.emitExecutionError(socket.id, "inviteToGame", "user unknown");
    else if (!recipientSocket)
      this.server
        .to(socket.id)
        .emit("declineInvite", { cause: "user offline" });
    else {
      this.userService
        .isBanned(executor.id, this.connections.get(recipientSocket).name)
        .then((isBanned) => {
          if (isBanned)
            this.server
              .to(socket.id)
              .emit("declineInvite", { cause: "you banned" });
          else if (this.connections.get(recipientSocket).inGame)
            this.server
              .to(socket.id)
              .emit("declineInvite", { cause: "user in game" });
          else
            this.server
              .to(recipientSocket)
              .emit("inviteToGame", { sender: executor.name });
        })
        .catch((e) =>
          this.emitExecutionError(socket.id, "inviteToGame", e.cause)
        );
    }
  }

  async sendDecline(socket: Socket, recipient: string) {
    const executorName = this.connections.get(socket.id).name;
    const recipientSocket = this.connectionByName(recipient);
    if (recipientSocket)
      this.server
        .to(recipientSocket)
        .emit("declineInvite", { cause: `${executorName} hates you =)` });
    else this.emitExecutionError(socket.id, "declineInvite", "user offline");
  }

  async emitGameState(data: DTO.gameStateDataI) {
    const room = this.gameRooms.get(data.gameName);
    if (!room) return;
    this.gameRooms.set(data.gameName, data);
    this.server.to(data.gameName).volatile.emit("gameState", data);
  }

  async finishGame(socketId: string, data: DTO.finishGameI) {
    const gameRoom = this.gameRooms.get(data.gameName);
    const executor = this.connections.get(socketId);
    if (!gameRoom || !executor) return;
    if (data.option == "meWinner") {
      gameRoom.playerFirst.score = 5;
      gameRoom.playerSecond.score = 10;
      if (gameRoom.playerFirst.name == executor.name) {
        gameRoom.playerFirst.score = 10;
        gameRoom.playerSecond.score = 5;
      }
    }
    if (data.option != "drop") {
      const winnerName =
        gameRoom.playerFirst.score > gameRoom.playerSecond.score
          ? gameRoom.playerFirst.name
          : gameRoom.playerSecond.name;
      this.server
        .to(data.gameName)
        .emit("gameFinished", { winnerName: winnerName });
      this.addGameResult(data);
    }
    this.gameRooms.delete(data.gameName);
    this.server.socketsLeave(data.gameName);
  }

  async getUserStat(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getStatsByName(data.targetUserName)
      .then((stats) => {
        this.server.to(socketId).emit("userStat", stats);
      })
      .catch((e) => this.emitExecutionError(socketId, "getUserStats", e.cause));
  }

  async getLadder(socketId: string) {
    return this.userService
      .getLadder()
      .then(async (ladder) => {
        this.server.to(socketId).emit("ladder", ladder);
      })
      .catch((e) => this.emitExecutionError(socketId, "getLadder", e.cause));
  }

  async checkNamePossibility(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getUserByName(data.targetUserName)
      .then((user) => {
        if (user) this.server.to(socketId).emit("nameTaken", data);
        else this.server.to(socketId).emit("nameAvailable", data);
      })
      .catch((e) =>
        this.emitExecutionError(socketId, "checkNamePossibility", e.cause)
      );
  }

  async getNamesSuggestions(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getNamesSuggestion(data.targetUserName)
      .then((names) => {
        this.server.to(socketId).emit("nameSuggestions", names);
      })
      .catch((e) =>
        this.emitExecutionError(socketId, "getNamesSuggestions", e.cause)
      );
  }

  async getActiveGames(socketId: string) {
    const activeGames: DTO.gameStateDataI[] = [];
    for (const el of this.gameRooms.values()) {
      activeGames.push(el);
    }
    this.server.to(socketId).emit("activeGames", activeGames);
  }

  setPaused(data: DTO.pauseGameI) {
    this.server.to(data.gameName).emit("setPause", data);
    const gameRoom = this.gameRooms.get(data.gameName);
    if (gameRoom) gameRoom.isPaused = data.isPaused;
  }

  async connectSpectator(socketId: string, data: DTO.spectateGameI) {
    const gameRoom = this.gameRooms.get(data.gameName);
    if (gameRoom) {
      this.server.to(socketId).emit("connectToGame", gameRoom);
      this.server.in(socketId).socketsJoin(gameRoom.gameName);
    } else this.emitNotAllowed(socketId, "spectateGame", "game unknown");
  }

  removeGame(room: string) {
    this.gameRooms.delete(room);
  }

  // PRIVATE FUNCTIONS

  private async addGameResult(data: DTO.finishGameI) {
    const gameRoom = this.gameRooms.get(data.gameName);
    if (gameRoom) {
      const gameResults: GameResultDto = {
        name: gameRoom.gameName,
        winnerName: gameRoom.playerFirst.name,
        loserName: gameRoom.playerSecond.name,
        winnerScore: gameRoom.playerFirst.score,
        loserScore: gameRoom.playerSecond.score,
      };
      if (gameRoom.playerFirst.score < gameRoom.playerSecond.score) {
        gameResults.winnerName = gameRoom.playerSecond.name;
        gameResults.loserName = gameRoom.playerFirst.name;
        gameResults.winnerScore = gameRoom.playerSecond.score;
        gameResults.loserScore = gameRoom.playerFirst.score;
      }
      if (gameRoom.playerFirst.score == gameRoom.playerSecond.score) return;
      this.gameService
        .addGame(gameResults)
        .then(() => {
          this.connections.forEach((client: DTO.ClientInfo) => {
            if (
              client.name == gameResults.winnerName ||
              client.name == gameResults.loserName
            ) {
              client.inGame = false;
            }
          });
        })
        .catch((e) => {
          console.log("Exception", e.message);
        });
    }
  }

  private async getUserFromJWT(JWTtoken: string): Promise<DTO.ClientInfo> {
    try {
      const decodedToken = this.jwtService.verify(JWTtoken, {
        secret: process.env.JWT_ACCESS_SECRET,
      }) as any;
      const user = await this.userService.getUserByName(decodedToken.username);
      return user;
    } catch (ex) {
      return null;
    }
  }

  private async connectToGame(data: DTO.gameStateDataI) {
    const game = this.gameRooms.set(data.gameName, data).get(data.gameName);
    // send to users game info
    for (const el of this.connections.entries()) {
      if (
        el[1].name == game.playerFirst.name ||
        el[1].name == game.playerSecond.name
      ) {
        el[1].inGame = true;
        this.server.in(el[0]).socketsJoin(game.gameName);
        this.server.to(el[0]).emit("gameLine", { inLine: false });
      }
    }
    this.server.to(game.gameName).emit("connectToGame", game);
  }

  private async connectUserToGames(socketId: string) {
    const client = this.connections.get(socketId);

    for (const el of this.gameRooms.values()) {
      if (
        el.playerFirst.name == client.name ||
        el.playerSecond.name == client.name
      ) {
        this.server.to(socketId).emit("connectToGame", el);
        this.server.to(el.gameName).emit("rivalOnline", { isOnline: true });
        this.server.in(socketId).socketsJoin(el.gameName);
        this.setPaused({ gameName: el.gameName, isPaused: true });
      }
    }
  }

  private async connectUserToChannels(socket: Socket) {
    const client = this.connections.get(socket.id);
    const channels = await this.userService.getChannels(client.id);

    channels.forEach((channelName) => {
      const channelInfoDtoIn: DTO.ChannelInfoIn = {
        name: channelName,
      };
      this.connectUserToChannel(channelInfoDtoIn, client);
    });
  }

  private async connectUserToChannel(
    channelIn: DTO.ChannelInfoIn,
    user: DTO.ClientInfo
  ) {
    return this.channelService
      .connectToChannel({
        name: channelIn.name,
        ownerId: user.id,
        isPrivate: channelIn.isPrivate,
        password: channelIn.password,
        type: channelIn.type,
      })
      .then(async (channel) => {
        // notice users in channel about new client
        this.server
          .to(channelIn.name)
          .emit(
            "userConnected",
            channel.name,
            await this.userService.getUserPublic(user.id, false, true)
          );

        // send to user channel info
        const channelInfo: DTO.ChannelInfoOut = {
          name: channel.name,
          users: channel.guests,
          messages: channel.messages,
          isPrivate: channel.isPrivate,
          hasPassword: !!channel.password,
        };
        this.connections.forEach((client: DTO.ClientInfo, socketId: string) => {
          if (client.name == user.name) {
            this.server.to(socketId).emit("channelInfo", channelInfo);
            this.server.in(socketId).socketsJoin(channelIn.name);
          }
        });
      })
      .catch((e) => {
        throw e;
      });
  }

  private leavePMChannels(socketId: string, banned: DTO.ClientInfo) {
    const PMChannel = this.createPMChannelInfo([
      banned.name,
      this.connections.get(socketId).name,
    ]);
    this.leaveChannel(socketId, PMChannel.name, banned).catch(() => {});
    this.leaveChannel(socketId, PMChannel.name).catch(() => {});
  }

  // user can not connect to channel:
  // 1 - channel is private
  // 2 - user banned
  // 3 - pasword incorrect
  private async canJoin(
    socketId: string,
    executor: DTO.ClientInfo,
    channel: ChannelEntity,
    channelIn: DTO.ChannelInfoIn,
    target: DTO.ClientInfo
  ): Promise<boolean> {
    if (channel == null || channel.admIds.includes(executor.id)) return true;
    if (channel.isPrivate) {
      this.emitNotAllowed(
        socketId,
        "connectToChannel",
        channelIn,
        "channel is private"
      );
      return false;
    }
    if (channel.bannedIds.includes(target.id)) {
      this.emitNotAllowed(
        socketId,
        "connectToChannel",
        channelIn,
        "user banned"
      );
      return false;
    }
    if (!channelIn.password) channelIn.password = "";
    return (
      !channel.password ||
      bcrypt
        .compare(channelIn.password, channel.password)
        .then((isMatch) => {
          if (isMatch) return true;
          this.emitNotAllowed(
            socketId,
            "connectToChannel",
            channelIn,
            "password incorrect"
          );
          return false;
        })
        .catch((e) => {
          console.log(e.cause);
          return false;
        })
    );
  }

  private connectionByName(name: string): string {
    for (const el of this.connections.entries()) {
      if (el[1].name == name) {
        return el[0];
      }
    }
    return null;
  }

  private createPMChannelInfo(names: string[]): DTO.ChannelInfoIn {
    names.sort((a: string, b: string) => a.localeCompare(b));
    return {
      name: `${names[0]} ${names[1]} pm`,
      isPrivate: true,
      type: "PRIVATE_MESSAGING",
    };
  }

  private async getInLine(socket: Socket) {
    const user = this.connections.get(socket.id);
    if (!user) this.emitExecutionError(socket.id, "getInLine", "user unknown");
    if (this.readyToPlayUsers.findIndex((value) => value.id == user.id) == -1) {
      this.readyToPlayUsers.push(user);
    }
    this.server.to(socket.id).emit("gameLine", { inLine: true });
    while (this.readyToPlayUsers.length > 1) {
      const first = this.readyToPlayUsers.pop();
      const second = this.readyToPlayUsers.pop();
      const game: DTO.gameStateDataI = {
        gameName: first.name + second.name + "Game",
        playerFirst: { name: first.name, score: 0, paddleY: 0 },
        playerSecond: { name: second.name, score: 0, paddleY: 0 },
        ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
        isPaused: false,
      };
      this.connectToGame(game);
    }
  }

  private async leaveLine(socket: Socket) {
    const user = this.connections.get(socket.id);
    if (!user) this.emitExecutionError(socket.id, "getInLine", "user unknown");
    this.readyToPlayUsers = this.readyToPlayUsers.filter(
      (userInLine) => userInLine.id != user.id
    );
    this.server.to(socket.id).emit("gameLine", { inLine: false });
  }

  private emitNotAllowed(
    socketId: string,
    eventName: string,
    data: any,
    cause: string = "you don't have enough rights"
  ) {
    this.server
      .to(socketId)
      .emit("notAllowed", { eventName: eventName, data: data, cause: cause });
  }

  private emitExecutionError(
    socketId: string,
    eventName: string,
    cause: string
  ) {
    this.server
      .to(socketId)
      .emit("executionError", { eventName: eventName, cause: cause });
  }
}
