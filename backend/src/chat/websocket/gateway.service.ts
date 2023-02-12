import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GatewayService {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly jwtService: JwtService
  ) {}

  gameRooms: Map<string, DTO.gameChannelDataI> = new Map();
  connections: Map<string, DTO.ClientInfo> = new Map();
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
        this.connectionSet(authorizedUser, socket);
      } else if (authName) {
        const user = await this.userService.getUserByName(authName);
        if (!user) return false;
        this.connectionSet(
          {
            id: user.id,
            name: user.name,
            socketId: socket.id,
          },
          socket
        );
      }
      // set user status online
      await this.userService.updateUser({
        where: {
          id: this.connections.get(socket.id).id,
        },
        data: {
          status: "ONLINE",
        },
      });
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

  connectionSet(client: DTO.ClientInfo, socket: Socket) {
    this.connections.set(socket.id, client);
  }

  async disconnectUser(socket: Socket) {
    const user = await this.userService.updateUser({
      where: {
        id: this.connections.get(socket.id).id,
      },
      data: {
        status: "OFFLINE",
      },
    });
    (
      await this.userService.getChannels(this.connections.get(socket.id).id)
    ).forEach((channelName) => {
      this.server
        .to(channelName)
        .emit("userDisconnected", channelName, user.name);
    });
    this.connections.delete(socket.id);
  }

  async connectToChannelPM(socket: Socket, channelIn: DTO.ChannelInfoIn) {
    if (
      await this.userService.isBanned(
        this.connections.get(socket.id).id,
        channelIn.users[0].name
      )
    ) {
      this.server.to(socket.id).emit("notAllowed", channelIn);
    } else {
      await this.connectUserToChannel(
        channelIn,
        this.connections.get(socket.id)
      );
      channelIn.users.forEach(async (user) => {
        await this.connectUserToChannel(
          channelIn,
          await this.userService.getUserByName(user.name)
        );
      });
    }
  }

  async newMessage(socket: Socket, message: CreateMessageDTO) {
    message.authorName = this.connections.get(socket.id).name;
    const messageOut = await this.channelService.addMessage(
      this.connections.get(socket.id).id,
      message
    );
    if (messageOut)
      this.server.to(message.channelName).emit("newMessage", messageOut);
    else this.server.to(socket.id).emit("notAllowed", message);
  }

  async addAdmin(socketId: string, data: DTO.ManageUserInChannelI) {
    const targetUser = await this.userService.getUserByName(
      data.targetUserName
    );
    if (
      await this.channelService.addAdmin(
        this.connections.get(socketId).id,
        data.channelName,
        targetUser.id
      )
    )
      this.server.to(data.channelName).emit("newAdmin", data);
    else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "addAdmin", data: data });
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
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "changeChannelName", data: data });
  }

  async setPrivacy(socketId: string, data: DTO.SetPrivacyI) {
    if (
      await this.channelService.setPrivacy(
        this.connections.get(socketId).id,
        data
      )
    ) {
      this.server.to(data.channelName).emit("privacySet", data);
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "setPrivacy", data: data });
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
    } else
      this.server.to(socketId).emit("notAllowed", {
        eventName: "setPassword",
        channelName: data.channelName,
      });
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
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "banUser", data: data });
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
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "muteUser", data: data });
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
    } else this.server.to(socket.id).emit("notAllowed", data);
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
    } else this.server.to(socket.id).emit("notAllowed", data);
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
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "connectToChannel", data: channelIn });
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
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", { eventName: "kickUser", data: data });
  }

  async leaveChannel(
    socketId: string,
    channelName: string,
    user: DTO.ClientInfo = this.connections.get(socketId)
  ) {
    await this.channelService.updateChannel({
      where: {
        name: channelName,
      },
      data: {
        guests: {
          disconnect: {
            id: user.id,
          },
        },
      },
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
        if (newFriend)
          this.server.to(socketId).emit("newFriend", {
            id: newFriend.id,
            name: newFriend.name,
            status: newFriend.status,
            image: newFriend.image,
            avatar: newFriend.avatar,
          });
        else
          this.server
            .to(socketId)
            .emit("notAllowed", { eventName: "addFriend", data: data });
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "addFriend", data: data });
      });
  }

  async removeFriend(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .removeFriend(this.connections.get(socketId).id, data.targetUserName)
      .then((exFriend) => {
        if (exFriend)
          this.server.to(socketId).emit("exFriend", {
            id: exFriend.id,
            name: exFriend.name,
            status: exFriend.status,
            image: exFriend.image,
            avatar: exFriend.avatar,
          });
        else
          this.server
            .to(socketId)
            .emit("notAllowed", { eventName: "removeFriend", data: data });
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "removeFriend", data: data });
      });
  }

  async getFriends(socketId: string) {
    await this.userService
      .getFriends(this.connections.get(socketId).id)
      .then((friendList) => {
        this.server.to(socketId).emit("friendList", friendList);
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "getFriends" });
      });
  }

  async banPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .banPersonally(this.connections.get(socketId).id, data.targetUserName)
      .then((newPersonnalyBanned) => {
        if (newPersonnalyBanned)
          this.server.to(socketId).emit("newPersonnalyBanned", {
            id: newPersonnalyBanned.id,
            name: newPersonnalyBanned.name,
            status: newPersonnalyBanned.status,
            image: newPersonnalyBanned.image,
            avatar: newPersonnalyBanned.avatar,
          });
        else
          this.server
            .to(socketId)
            .emit("notAllowed", { eventName: "banPersonnaly", data: data });
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "banPersonnaly", data: data });
      });
  }

  async unbanPersonally(socketId: string, data: DTO.ManageUserI) {
    this.userService
      .unbanPersonally(this.connections.get(socketId).id, data.targetUserName)
      .then((exPersonnalyBanned) => {
        if (exPersonnalyBanned)
          this.server.to(socketId).emit("exPersonnalyBanned", {
            id: exPersonnalyBanned.id,
            name: exPersonnalyBanned.name,
            status: exPersonnalyBanned.status,
            image: exPersonnalyBanned.image,
            avatar: exPersonnalyBanned.avatar,
          });
        else
          this.server
            .to(socketId)
            .emit("notAllowed", { eventName: "unbanPersonally", data: data });
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "unbanPersonally", data: data });
      });
  }

  async getPersonallyBanned(socketId: string) {
    this.userService
      .getPersonallyBanned(this.connections.get(socketId).id)
      .then((personallyBannedList) => {
        this.server
          .to(socketId)
          .emit("personallyBannedList", personallyBannedList);
      })
      .catch((e) => {
        console.log(e.message);
        this.server
          .to(socketId)
          .emit("notAllowed", { eventName: "personallyBannedList" });
      });
  }

  async emitToRecipient(event: string, socket: Socket, recipient: string) {
    const executorName = this.connections.get(socket.id).name;
    console.log({ executorName, event, recipient });
    const recipientUser = await this.userService.getUserByName(recipient);
    const recipientConnection = this.connectionByName(recipientUser?.name);
    if (recipientConnection)
      this.server.to(recipientConnection).emit(event, { sender: executorName });
    else return null;
  }

  async connectToGame(socket: Socket, data: DTO.gameChannelDataI) {
    console.log("connectToGame data", data);

    const username = this.connections.get(socket.id).name;
    const user = await this.userService.getUserByName(username);
    // const game = this.gameRooms.has(data.name)
    //   ? this.gameRooms.get(data.name)
    //   : this.gameRooms.set(data.name, data).get(data.name);
    const game = this.gameRooms.set(data.name, data).get(data.name);
    // this.server.to(game.name).emit("userConnectedToGame", game.name, username);
    console.log("connectToGame", game);

    // send to user game info
    this.connections.forEach((value: DTO.ClientInfo, key: string) => {
      if (game.first === value.name || game.second === value.name) {
        console.log("Joined", value.name);
        this.server.to(key).emit("joinedToGame", game);
        this.server.sockets.sockets.get(key).join(game.name);
      }
    });
  }

  async getCoordinates(socket: Socket, data: any) {
    const userName = this.connections.get(socket.id).name;
    this.server
      .to(data.game)
      .volatile.emit("coordinates", { player: userName, ...data });
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

  async getUserStat(id: string, data: DTO.ManageUserI) {
    return this.userService
      .getUserByName(data.targetUserName)
      .then(async (user) => {
        const stats = await this.userService.getStats(user.id);
        if (stats) this.server.to(id).emit("userStat", stats);
        else
          this.server
            .to(id)
            .emit("notAllowed", { eventName: "getUserStats", data: data });
      })
      .catch((e) => {
        this.server
          .to(id)
          .emit("notAllowed", { eventName: "getUserStats", data: data });
      });
  }

  async getLadder(id: string) {
    return this.userService
      .getLadder()
      .then(async (ladder) => {
        this.server.to(id).emit("ladder", ladder);
      })
      .catch((e) => {
        this.server.to(id).emit("notAllowed", { eventName: "getLadder" });
      });
  }

  async checkNamePossibility(id: string, data: DTO.ManageUserI) {
    return this.userService
      .getUserByName(data.targetUserName)
      .then((user) => {
        if (user) this.server.to(id).emit("nameTaken", data);
        else this.server.to(id).emit("nameAvailable", data);
      })
      .catch((e) => {
        this.server.to(id).emit("notAllowed", { eventName: "checkNamePossibility" });
      });
  }

  async getNamesSuggestions(id: string, data: DTO.ManageUserI) {
    return this.userService
      .getNamesSuggestion(data.targetUserName)
      .then((names) => {
        this.server.to(id).emit("nameSuggestions", names);
      })
      .catch((e) => {
        this.server.to(id).emit("notAllowed", { eventName: "getNamesSuggestions", data : data });
      });
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
    // if (!user) return;
    const channel = await this.channelService.connectToChannel({
      name: channelIn.name,
      ownerId: user.id,
      isPrivate: channelIn.isPrivate,
      password: channelIn.password,
    });

    // notice users in channel about new client
    this.server
      .to(channelIn.name)
      .emit(
        "userConnected",
        channel.name,
        await this.userService.getUser(user.id, false, true)
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
}
