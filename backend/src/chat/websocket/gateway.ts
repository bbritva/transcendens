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
import { GatewayService } from "./gateway.service";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3001"],
  },
})
export class Gateway implements OnModuleInit {
  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private gatewayService: GatewayService,
  ) {}

  @WebSocketServer()
  server: Server;

  connections: Map<string, DTO.ClientInfo> = new Map();


  onModuleInit() {
    this.gatewayService.setServer(this.server);
    this.server.on("connection", async (socket) => {

      // check authorisation
      if (! await this.gatewayService.authorizeUser(socket)) {
        socket.disconnect(true);
        return;
      }

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
  async onConnectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.connectToChannel(socket, channelIn);
  }

  @SubscribeMessage("leaveChannel")
  async onLeaveChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.leaveChannel(
      socket.id,
      channelIn.name,
      this.connections.get(socket.id)
    );
  }

  @SubscribeMessage("privateMessage")
  async onPrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.connectToChannelPM(socket, channelIn);
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: CreateMessageDTO
  ) {
    this.gatewayService.newMessage(socket, message)
  }

  @SubscribeMessage("addAdmin")
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    const targetUser = await this.userService.getUserByName(data.params[0]);
    if (
      await this.channelService.addAdmin(
        this.connections.get(socket.id).id,
        data.name,
        targetUser.id
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
    const targetUser = await this.userService.getUserByName(data.params[0]);
    if (
      await this.channelService.banUser(
        this.connections.get(socket.id).id,
        data.name,
        targetUser.id
      )
    ) {
      this.gatewayService.leaveChannel(
        socket.id,
        data.name,
        targetUser
      );
      this.server.to(socket.id).emit("userBanned", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("muteUser")
  async onMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    const targetUser = await this.userService.getUserByName(data.params[0]);
    if (
      await this.channelService.muteUser(
        this.connections.get(socket.id).id,
        data.name,
        targetUser.id
      )
    ) {
      this.server.to(data.name).emit("userMuted", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  @SubscribeMessage("unmuteUser")
  async onUnmuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
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

  @SubscribeMessage("unbanUser")
  async onUnbanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
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

  @SubscribeMessage("kickUser")
  async onKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.kickUser(
      this.connections.get(socket.id),
      data,
      this.server
    );
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
    this.connections.forEach((client: DTO.ClientInfo, socketId: string) => {
      if (client.name == user.name) {
        this.server.to(socketId).emit("joinedToChannel", channelInfo);
        this.server.in(socketId).socketsJoin(channelIn.name);
      }
    });
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
}
