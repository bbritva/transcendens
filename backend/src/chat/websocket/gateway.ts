import { OnModuleInit } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";
import { env } from "process";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3001"],
  },
})
export class Gateway implements OnModuleInit {
  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private jwtService: JwtService
  ) {}

  connections: Map<string, DTO.ClientInfo> = new Map();

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", async (socket) => {
      // have to check authorisation
      let authToken = socket.handshake.auth.token;
      let authName = socket.handshake.auth.username;
      const authorizedUser = await this.getUserFromJWT(authToken);
      if (!authorizedUser && !authName) {
        this.server.emit("connectError", { message: "invalid username" });
        socket.disconnect(true);
        console.log("connectError");
        return;
      } else if (authorizedUser) {
        this.connectionSet(authorizedUser, socket);
        console.log("authorizedUser:", authorizedUser.name);
      } else if (authName) {
        console.log("nonAuthorizedUser:", authName);
        const user = await this.userService.getUserByName(authName);
        if (user) this.connectionSet(user, socket);
        else {
          socket.disconnect(true);
          console.log("connectError");
          return;
        }
      }

      // event handler
      this.onConnection(socket);

      //disconnection handler
      socket.on("disconnecting", async () => {
        this.onDisconnecting(socket);
      });
      socket.on("disconnect", async () => {});
    });
  }

  connectionSet(client: DTO.ClientInfo, socket: Socket) {
    this.connections.set(socket.id, client);
  }

  @SubscribeMessage("connectToChannel")
  async connectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    const user = this.connections.get(socket.id);
    const channel = await this.channelService.getChannel(channelIn.name);
    // check possibility
    if (this.canConnect(user, channel, channelIn, user)) {
      await this.connectUserToChannel(
        channelIn,
        this.connections.get(socket.id)
      );
      channelIn.users.forEach(async (userName) => {
        const targetUser = await this.userService.getUserByName(userName.name);
        if (this.canConnect(user, channel, channelIn, targetUser))
          await this.connectUserToChannel(channelIn, targetUser);
      });
    }
  }

  @SubscribeMessage("privateMessage")
  async connectToChannelPM(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
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

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateMessageDTO
  ) {
    data.authorName = this.connections.get(socket.id).name;
    const messageOut = await this.channelService.addMessage(
      this.connections.get(socket.id).id,
      data
    );
    if (messageOut)
      this.server.to(data.channelName).emit("newMessage", messageOut);
    else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("addAdmin")
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    if (
      await this.channelService.addAdmin(
        this.connections.get(socket.id).id,
        data
      )
    )
      this.server.to(data.name).emit("newAdmin", data);
    else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("setPrivacy")
  async onSetPrivacy(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    if (
      await this.channelService.setPrivacy(
        this.connections.get(socket.id).id,
        data
      )
    ) {
      this.server.to(data.name).emit("setPrivacy", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("setPassword")
  async onSetPassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    if (
      await this.channelService.setPassword(
        this.connections.get(socket.id).id,
        data
      )
    ) {
      this.server.to(data.name).emit("setPassword", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("banUser")
  async onBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    if (
      await this.channelService.banUser(
        this.connections.get(socket.id).id,
        data.name,
        (
          await this.userService.getUserByName(data.params[0])
        ).id
      )
    ) {
      this.disconnectFromChannel(
        data.name,
        await this.userService.getUserByName(data.params[0])
      );
      this.server.to(data.name).emit("userBanned", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("kickUser")
  async onKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    const channel = await this.channelService.getChannel(data.name);
    if (channel.admIds.includes(this.connections.get(socket.id).id)) {
      this.channelService.updateChannel({
        where: {
          name: data.name,
        },
        data: {
          guests: {
            disconnect: {
              id: (await this.userService.getUserByName(data.params[0])).id,
            },
          },
        },
      });
      this.disconnectFromChannel(
        data.name,
        await this.userService.getUserByName(data.params[0])
      );
      this.server.to(data.name).emit("userKicked", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("muteUser")
  async onMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    const channel = await this.channelService.getChannel(data.name);
    if (channel.admIds.includes(this.connections.get(socket.id).id)) {
      this.channelService.updateChannel({
        where: {
          name: data.name,
        },
        data: {
          mutedIds: {
            push: (await this.userService.getUserByName(data.params[0])).id,
          },
        },
      });
      this.disconnectFromChannel(
        data.name,
        await this.userService.getUserByName(data.params[0])
      );
      this.server.to(data.name).emit("userMuted", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  private async getUserFromJWT(JWTtoken: string): Promise<DTO.ClientInfo> {
    try {
      const decodedToken = this.jwtService.verify(JWTtoken, {
        secret: env.JWT_ACCESS_SECRET,
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
    this.connections.forEach((value: DTO.ClientInfo, key: string) => {
      if (value.name == user.name) {
        this.server.to(key).emit("joinedToChannel", channelInfo);
        this.server.sockets.sockets.get(key).join(channelIn.name);
      }
    });
  }

  private async disconnectUserFromChannels(user: DTO.ClientInfo) {
    (await this.userService.getChannels(user.id)).forEach((channelName) => {
      this.disconnectFromChannel(channelName, user);
    });
  }

  private async disconnectFromChannel(
    channelName: string,
    user: DTO.ClientInfo
  ) {
    // notice users in channel about client disconnected
    this.server
      .to(channelName)
      .emit("userDisconnected", channelName, user.name);
  }

  private async onConnection(socket: Socket) {
    if (
      await this.userService.updateUser({
        where: {
          id: this.connections.get(socket.id).id,
        },
        data: {
          status: "ONLINE",
        },
      })
    ) {
      //send to new user all channels
      this.server
        .to(socket.id)
        .emit("channels", await this.channelService.ChannelList());

      //connect user to his channels
      this.connectUserToChannels(socket);
    } else socket.disconnect(true);
  }

  private async onDisconnecting(socket: Socket) {
    this.disconnectUserFromChannels(this.connections.get(socket.id));
    const user = await this.userService.updateUser({
      where: {
        id: this.connections.get(socket.id).id,
      },
      data: {
        status: "OFFLINE",
      },
    });
    this.connections.delete(socket.id);
  }

  // user can connect to channel:
  // 1 channel doesn't exist
  // 2 channel admin adds user
  // 3 channel is public, password is correct and user is not banned
  async canConnect(
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
}
