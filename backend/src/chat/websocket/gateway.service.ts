import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { GameResultDto } from "src/game/dto/create-game.dto";
import { GameService } from "src/game/game.service";

@Injectable()
export class GatewayService {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly gameService: GameService,
    private readonly jwtService: JwtService
  ) {}

  gameRooms: Map<string, DTO.gameChannelDataI> = new Map();
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
        this.connections.set(socket.id, authorizedUser);
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
          this.server
            .to(channel.name)
            .emit("userDisconnected", channel.name, user.name);
        });
      })
      .catch((e) => {
        console.log(e.message);
      });
    this.readyToPlayUsers = this.readyToPlayUsers.filter(
      (user) => user.name != this.connections.get(socket.id).name
    );
    this.connections.delete(socket.id);
  }

  async connectToChannelPM(socket: Socket, data: DTO.ManageUserI) {
    try {
      const targetUser = await this.userService.getUserByName(
        data.targetUserName
      );
      if (targetUser.bannedIds.includes(this.connections.get(socket.id).id)) {
        this.emitNotAllowed(socket.id, "privateMessage", data);
      } else {
        const channelIn = this.createPMChannelName([
          this.connections.get(socket.id).name,
          data.targetUserName,
        ]);
        await this.connectUserToChannel(
          channelIn,
          this.connections.get(socket.id)
        );
        this.connectUserToChannel(channelIn, targetUser);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async newMessage(socket: Socket, message: CreateMessageDTO) {
    message.authorName = this.connections.get(socket.id).name;
    return this.channelService
      .addMessage(this.connections.get(socket.id).id, message)
      .then((messageOut) => {
        this.server.to(message.channelName).emit("newMessage", messageOut);
      })
      .catch((e) => {
        this.emitNotAllowed(socket.id, "newMessage", message);
      });
  }

  async addAdmin(socketId: string, data: DTO.ManageUserInChannelI) {
    this.userService
      .getUserByName(data.targetUserName)
      .then(async (targetUser) => {
        if (
          await this.channelService.addAdmin(
            this.connections.get(socketId).id,
            data.channelName,
            targetUser.id
          )
        )
          this.server.to(data.channelName).emit("newAdmin", data);
      })
      .catch((e) => {
        this.emitNotAllowed(socketId, "addAdmin", data);
      });
  }

  async changeChannelName(socketId: string, data: DTO.ChangeChannelNameI) {
    if (
      await this.channelService.changeChannelName(
        this.connections.get(socketId).id,
        data
      )
    ) {
      // connect all users to new room
      this.server.in(data.channelName).socketsJoin(data.newName);
      // leave old room
      this.server.socketsLeave(data.channelName);
      // notice user about new channel name
      this.server.to(data.newName).emit("newChannelName", data);
    } else this.emitNotAllowed(socketId, "changeChannelName", data);
  }

  async setPrivacy(socketId: string, data: DTO.SetPrivacyI) {
    if (
      await this.channelService.setPrivacy(
        this.connections.get(socketId).id,
        data
      )
    ) {
      this.server.to(data.channelName).emit("privacySet", data);
    } else this.emitNotAllowed(socketId, "setPrivacy", data);
  }

  async setPassword(socketId: string, data: DTO.SetPasswordI) {
    if (
      await this.channelService.setPassword(
        this.connections.get(socketId).id,
        data
      )
    ) {
      this.server
        .to(data.channelName)
        .emit("passwordSet", { channelName: data.channelName });
    } else this.emitNotAllowed(socketId, "setPassword", data);
  }

  async banUser(socketId: string, data: DTO.ManageUserInChannelI) {
    const targetUser = await this.userService.getUserByName(
      data.targetUserName
    );
    if (
      await this.channelService.banUser(
        this.connections.get(socketId).id,
        data.channelName,
        targetUser.id
      )
    ) {
      await this.leaveChannel(socketId, data.channelName, targetUser);
      this.server.to(socketId).emit("userBanned", data);
    } else this.emitNotAllowed(socketId, "banUser", data);
  }

  async muteUser(socketId: string, data: DTO.ManageUserInChannelI) {
    const targetUser = await this.userService.getUserByName(
      data.targetUserName
    );
    if (
      await this.channelService.muteUser(
        this.connections.get(socketId).id,
        data.channelName,
        targetUser.id
      )
    ) {
      this.server.to(data.channelName).emit("userMuted", data);
    } else this.emitNotAllowed(socketId, "muteUser", data);
  }

  async unmuteUser(socket: Socket, data: DTO.ManageUserInChannelI) {
    const targetUser = await this.userService.getUserByName(
      data.targetUserName
    );
    if (
      this.channelService.unmuteUser(
        this.connections.get(socket.id).id,
        data.channelName,
        targetUser.id
      )
    ) {
      this.server.to(socket.id).emit("userUnmuted", data);
    } else this.emitNotAllowed(socket.id, "unmuteUser", data);
  }

  async unbanUser(socket: Socket, data: DTO.ManageUserInChannelI) {
    const targetUser = await this.userService.getUserByName(
      data.targetUserName
    );
    if (
      this.channelService.unbanUser(
        this.connections.get(socket.id).id,
        data.channelName,
        targetUser.id
      )
    ) {
      this.server.to(socket.id).emit("userUnbanned", data);
    } else this.emitNotAllowed(socket.id, "unbanUser", data);
  }

  async connectToChannel(socketId: string, channelIn: DTO.ChannelInfoIn) {
    const user = this.connections.get(socketId);
    const channel = await this.channelService.getChannel(channelIn.name);
    // check possibility
    if (await this.canConnect(user, channel, channelIn, user)) {
      await this.connectUserToChannel(
        channelIn,
        this.connections.get(socketId)
      );
      if (channelIn.users) {
        channelIn.users.forEach(async (userName) => {
          const targetUser = await this.userService.getUserByName(
            userName.name
          );
          if (this.canConnect(user, channel, channelIn, targetUser))
            await this.connectUserToChannel(channelIn, targetUser);
        });
      }
    } else this.emitNotAllowed(socketId, "connectToChannel", channelIn);
  }

  async kickUser(socketId: string, data: DTO.ManageUserInChannelI) {
    const channel = await this.channelService.getChannel(data.channelName);
    if (channel.admIds.includes(this.connections.get(socketId).id)) {
      let targetUser: DTO.ClientInfo;
      this.connections.forEach((client: DTO.ClientInfo) => {
        if (client.name == data.targetUserName) {
          targetUser = client;
        }
      });
      if (targetUser == undefined)
        targetUser = await this.userService.getUserByName(data.targetUserName);
      await this.leaveChannel(socketId, data.channelName, targetUser);
      this.server.to(socketId).emit("userKicked", data.channelName);
    } else this.emitNotAllowed(socketId, "kickUser", data);
  }

  async leaveChannel(
    socketId: string,
    channelName: string,
    user: DTO.ClientInfo = this.connections.get(socketId)
  ) {
    this.channelService.leaveChannel(user.id, channelName).catch((e) => {
      console.log(e.message);
    });
    // notice user
    this.server.to(user.socketId).emit("leftChannel", channelName);
    // exit room
    this.server.in(user.socketId).socketsLeave(channelName);
    // notice channel
    this.server.to(channelName).emit("userLeft", channelName, user);
  }

  async addFriend(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .addFriend(this.connections.get(socketId).id, data.targetUserName)
      .then((newFriend) => {
        if (newFriend) this.server.to(socketId).emit("newFriend", newFriend);
        else this.emitNotAllowed(socketId, "addFriend", data);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "addFriend", data);
      });
  }

  removeFriend(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .removeFriend(this.connections.get(socketId).id, data.targetUserName)
      .then((exFriend) => {
        if (exFriend) this.server.to(socketId).emit("exFriend", exFriend);
        else this.emitNotAllowed(socketId, "removeFriend", data);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "removeFriend", data);
      });
  }

  getFriends(socketId: string) {
    this.userService
      .getFriends(this.connections.get(socketId).id)
      .then((friendList) => {
        this.server.to(socketId).emit("friendList", friendList);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "getFriends", {});
      });
  }

  async banPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .banPersonally(this.connections.get(socketId).id, data.targetUserName)
      .then((banned) => {
        if (banned)
          this.server.to(socketId).emit("newPersonnalyBanned", banned);
        else this.emitNotAllowed(socketId, "banPersonnaly", data);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "banPersonnaly", data);
      });
  }

  async unbanPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .unbanPersonally(this.connections.get(socketId).id, data.targetUserName)
      .then((exBanned) => {
        if (exBanned)
          this.server.to(socketId).emit("exPersonnalyBanned", exBanned);
        else this.emitNotAllowed(socketId, "unbanPersonally", data);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "unbanPersonally", data);
      });
  }

  async getPersonallyBanned(socketId: string) {
    this.userService
      .getPersonallyBanned(this.connections.get(socketId).id)
      .then((bannedList) => {
        this.server.to(socketId).emit("personallyBannedList", bannedList);
      })
      .catch((e) => {
        console.log(e.message);
        this.emitNotAllowed(socketId, "personallyBannedList", {});
      });
  }

  async startGame(socket: Socket, data: DTO.AcceptInviteI) {
    const acceptorName = this.connections.get(socket.id).name;
    const game = {
      gameName: data.sender + acceptorName + "Game",
      playerFirstName: data.sender,
      playerSecondName: acceptorName,
    };
    this.connectToGame(game);
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
    if (recipientSocket) {
      if (
        await this.userService.isBanned(
          executor.id,
          this.connections.get(recipientSocket).name
        )
      )
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
    } else
      this.server
        .to(socket.id)
        .emit("declineInvite", { cause: "user offline" });
  }

  async sendDecline(socket: Socket, recipient: string) {
    const executorName = this.connections.get(socket.id).name;
    const recipientSocket = this.connectionByName(recipient);
    if (recipientSocket)
      this.server
        .to(recipientSocket)
        .emit("declineInvite", { cause: `${executorName} hates you =)` });
    else return null;
  }

  async emitGameState(data: DTO.gameStateDataI) {
    this.gameRooms.get(data.gameName).gameState = data;
    this.server.to(data.gameName).volatile.emit("gameState", data);
  }

  async addGameResult(socket: Socket, data: GameResultDto) {
    this.gameService
      .addGame(data)
      .then(() => {
        this.connections.forEach((client: DTO.ClientInfo) => {
          if (client.name == data.winnerName || client.name == data.loserName) {
            client.inGame = false;
          }
        });
        this.server.to(data.name).emit("gameFinished", data);
        this.gameRooms.delete(data.name);
        this.server.socketsLeave(data.name);
      })
      .catch((e) => {
        console.log("Exception", e.message);
        this.emitNotAllowed(socket.id, "endGame", data);
      });
  }

  async getUserStat(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getStatsByName(data.targetUserName)
      .then(async (stats) => {
        this.server.to(socketId).emit("userStat", stats);
      })
      .catch((e) => {
        this.emitNotAllowed(socketId, "getUserStats", data);
      });
  }

  async getLadder(socketId: string) {
    return this.userService
      .getLadder()
      .then(async (ladder) => {
        this.server.to(socketId).emit("ladder", ladder);
      })
      .catch((e) => {
        this.emitNotAllowed(socketId, "getLadder", {});
      });
  }

  async checkNamePossibility(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getUserByName(data.targetUserName)
      .then((user) => {
        if (user) this.server.to(socketId).emit("nameTaken", data);
        else this.server.to(socketId).emit("nameAvailable", data);
      })
      .catch((e) => {
        this.emitNotAllowed(socketId, "checkNamePossibility", {});
      });
  }

  async getNamesSuggestions(socketId: string, data: DTO.ManageUserI) {
    return this.userService
      .getNamesSuggestion(data.targetUserName)
      .then((names) => {
        this.server.to(socketId).emit("nameSuggestions", names);
      })
      .catch((e) => {
        this.emitNotAllowed(socketId, "getNamesSuggestions", data);
      });
  }

  async getActiveGames(socketId: string) {
    const activeGames: DTO.gameChannelDataI[] = [];
    for (const el of this.gameRooms.values()) {
      activeGames.push(el);
    }
    this.server.to(socketId).emit("activeGames", activeGames);
  }

  async connectSpectator(socketId: string, data: DTO.spectateGameI) {
    const gameRoom = this.gameRooms.get(data.gameName);
    this.server.to(socketId).emit("connectToGame", gameRoom);
    this.server.in(socketId).socketsJoin(gameRoom.gameName);
  }

  // PRIVATE FUNCTIONS
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

  private async connectToGame(data: DTO.gameChannelDataI) {
    const game = this.gameRooms.set(data.gameName, data).get(data.gameName);
    // send to users game info
    for (const el of this.connections.entries()) {
      if (el[1].name == game.playerFirstName || game.playerSecondName === el[1].name) {
        el[1].inGame = true;
        this.server.in(el[0]).socketsJoin(game.gameName);
      }
    }
    this.server.to(game.gameName).emit("connectToGame", game);
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
            this.server.to(socketId).emit("joinedToChannel", channelInfo);
            this.server.in(socketId).socketsJoin(channelIn.name);
          }
        });
      })
      .catch((e) => {
        throw e;
      });
  }

  // user can connect to channel:
  // 1 channel doesn't exist
  // 2 channel admin adds user
  // 3 channel is public, password is correct and user is not banned
  private async canConnect(
    executor: DTO.ClientInfo,
    channel: ChannelEntity,
    channelIn: DTO.ChannelInfoIn,
    target: DTO.ClientInfo
  ): Promise<boolean> {
    return (
      channel == null ||
      channel.admIds.includes(executor.id) ||
      (!channel.isPrivate &&
        channel.password == channelIn.password &&
        !channel.bannedIds.includes(target.id))
    );
  }

  private connectionByName(name: string) {
    for (const el of this.connections.entries()) {
      if (el[1].name == name) {
        return el[0];
      }
    }
    return null;
  }

  private createPMChannelName(names: string[]): DTO.ChannelInfoIn {
    names.sort((a: string, b: string) => a.localeCompare(b));
    return {
      name: `${names[0]} ${names[1]} pm`,
      isPrivate: true,
      type: "PRIVATE_MESSAGING",
    };
  }

  private async getInLine(socket: Socket) {
    const user = this.connections.get(socket.id);
    if (this.readyToPlayUsers.findIndex((value) => value.id == user.id) == -1) {
      this.readyToPlayUsers.push(user);
      while (this.readyToPlayUsers.length > 1) {
        const first = this.readyToPlayUsers.pop();
        const second = this.readyToPlayUsers.pop();
        const game = {
          gameName: first.name + second.name + "Game",
          playerFirstName: first.name,
          playerSecondName: second.name,
        };
        this.connectToGame(game);
      }
    }
    this.server.to(socket.id).emit("gameLine", { inLine: true });
  }

  private async leaveLine(socket: Socket) {
    const userIndex = this.readyToPlayUsers.findIndex(
      (value) => value.id == this.connections.get(socket.id).id
    );
    if (userIndex != -1) {
      this.readyToPlayUsers.splice(userIndex, 1);
    }
    this.server.to(socket.id).emit("gameLine", { inLine: false });
  }

  private emitNotAllowed(socketId: string, eventName: string, data: any) {
    this.server.to(socketId).emit(eventName, data);
  }
}
