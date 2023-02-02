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

  async addAdmin(socketId: string, channelName: string, userName: string) {
    const targetUser = await this.userService.getUserByName(userName);
    if (
      await this.channelService.addAdmin(
        this.connections.get(socketId).id,
        channelName,
        targetUser.id
      )
    )
      this.server.to(channelName).emit("newAdmin", [channelName, userName]);
    else this.server.to(socketId).emit("notAllowed", [channelName, userName]);
  }

  async changeChannelName(socketId: string, oldName: string, newName: string) {
    if (
      await this.channelService.changeChannelName(
        this.connections.get(socketId).id,
        oldName,
        newName
      )
    ) {
      // connect all users to new room
      this.server.in(oldName).socketsJoin(newName);
      // leave old room
      this.server.socketsLeave(oldName);
      // notice user about new channel name
      this.server.to(newName).emit("newChannelName", [oldName, newName]);
    } else this.server.to(socketId).emit("notAllowed", [oldName, newName]);
  }

  async setPrivacy(socketId: string, channelName: string, isPrivate: boolean) {
    if (
      await this.channelService.setPrivacy(
        this.connections.get(socketId).id,
        channelName,
        isPrivate
      )
    ) {
      this.server
        .to(channelName)
        .emit("privacySet", [channelName, isPrivate.toString()]);
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", [channelName, isPrivate.toString()]);
  }

  async setPassword(socketId: string, data: DTO.ManageChannel) {
    if (
      await this.channelService.setPassword(
        this.connections.get(socketId).id,
        data
      )
    ) {
      this.server.to(data.name).emit("setPassword", data);
    } else this.server.to(socketId).emit("notAllowed", data);
  }

  async banUser(socketId: string, channelName: string, targetUserName: string) {
    const targetUser = await this.userService.getUserByName(targetUserName);
    if (
      await this.channelService.banUser(
        this.connections.get(socketId).id,
        channelName,
        targetUser.id
      )
    ) {
      await this.leaveChannel(socketId, channelName, targetUser);
      this.server
        .to(socketId)
        .emit("userBanned", [channelName, targetUserName]);
    } else
      this.server
        .to(socketId)
        .emit("notAllowed", [channelName, targetUserName]);
  }

  async muteUser(socketId: string, channelName: string, targetUserName: string) {
    const targetUser = await this.userService.getUserByName(targetUserName);
    if (
      await this.channelService.muteUser(
        this.connections.get(socketId).id,
        channelName,
        targetUser.id
      )
    ) {
      this.server.to(channelName).emit("userMuted", [channelName, targetUserName]);
    } else this.server.to(socketId).emit("notAllowed", [channelName, targetUserName]);
  }

  async unmuteUser(socket: Socket, data: DTO.ManageChannel) {
    const targetUser = await this.userService.getUserByName(data.params[0]);
    if (
      this.channelService.unmuteUser(
        this.connections.get(socket.id).id,
        data.name,
        targetUser.id
      )
    ) {
      this.server.to(socket.id).emit("userUnmuted", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  async unbanUser(socket: Socket, data: DTO.ManageChannel) {
    const targetUser = await this.userService.getUserByName(data.params[0]);
    if (
      this.channelService.unbanUser(
        this.connections.get(socket.id).id,
        data.name,
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
      channelIn.users.forEach(async (userName) => {
        const targetUser = await this.userService.getUserByName(userName.name);
        if (this.canConnect(user, channel, channelIn, targetUser))
          await this.connectUserToChannel(channelIn, targetUser);
      });
    } else this.server.to(socketId).emit("notAllowed", channelIn);
  }

  async kickUser(socketId: string, channelName: string, targetUserName: string) {
    const channel = await this.channelService.getChannel(channelName);
    if (channel.admIds.includes(this.connections.get(socketId).id)) {
      console.log(this.server.sockets.adapter.rooms);

      let targetUser : DTO.ClientInfo;
      this.connections.forEach((client: DTO.ClientInfo) => {
        if (client.name == targetUserName) {
          targetUser = client;
        }
      })
      if (targetUser == undefined)
        targetUser = await this.userService.getUserByName(targetUserName)
      await this.leaveChannel(socketId, channelName, targetUser);
      this.server.to(socketId).emit("userKicked", channelName);
    } else this.server.to(socketId).emit("notAllowed", channelName);
  }

// should i devide leave channal in db and on server?
  async leaveChannel(
    socketId: string,
    channelName: string,
    user: DTO.ClientInfo = this.connections.get(socketId)
  ) {
    console.log(socketId, user);
    
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
    if (!user) return;
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
    console.log(target.id, channel.bannedIds);
    return (
      channel == null ||
      channel.admIds.includes(executor.id) ||
      (!channel.isPrivate &&
        channel.password == channelIn.password &&
        !channel.bannedIds.includes(target.id))
    );
  }
}
