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
import { MessageService } from "src/chat/message/message.service";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3001"],
  },
})
export class Gateway implements OnModuleInit {
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private channelService: ChannelService
  ) {}

  connections: Map<string, DTO.ConnectedClientInfo> = new Map();

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", async (socket) => {
      // have to check authorisation

      // event handler
      this.onConnection(socket);

      // discinnection handlers
      socket.on("disconnecting", async () => {
        this.onDisconnecting(socket);
      });
      socket.on("disconnect", async () => {});
    });
  }

  @SubscribeMessage("connectToChannel")
  async connectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    const user = await this.getClientDTOByName(
      this.connections.get(socket.id).name
    );
    const channel = await this.channelService.getChannel(channelIn.name);
    // check possibility
    if (this.canConnect(user, channel, channelIn, user)) {
      await this.connectUserToChannel(
        channelIn,
        await this.getClientDTOByName(this.connections.get(socket.id).name)
      );
      channelIn.users.forEach(async (userName) => {
        const targetUser = await this.getClientDTOByName(userName.name);
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
      this.userService.isBanned(
        (await this.getClientDTOByName(channelIn.users[0].name)).id,
        channelIn.users[1].name
      )
    ) {
      this.server.to(socket.id).emit("notAllowed", channelIn);
    } else {
      await this.connectUserToChannel(
        channelIn,
        await this.getClientDTOByName(this.connections.get(socket.id).name)
      );
      channelIn.users.forEach(async (user) => {
        await this.connectUserToChannel(
          channelIn,
          await this.getClientDTOByName(user.name)
        );
      });
    }
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateMessageDTO
  ) {
    if (
      this.channelService.isMuted(
        data.channelName,
        (await this.getClientDTOByName(this.connections.get(socket.id).name)).id
      )
    )
      this.server.to(socket.id).emit("notAllowed", data);
    else {
      try {
        const messageOut = await this.messageService.createMessage({
          channel: {
            connect: { name: data.channelName },
          },
          authorName: data.authorName,
          text: data.text,
        });
        this.server.to(data.channelName).emit("newMessage", messageOut);
      } catch (e) {
        console.log("err", e.meta.cause);
      }
    }
  }

  @SubscribeMessage("addAdmin")
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    if (
      (await this.channelService.addAdmin(
        (
          await this.getClientDTOByName(this.connections.get(socket.id).name)
        ).id,
        data
      )) != 0
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
      (await this.channelService.setPrivacy(
        (
          await this.getClientDTOByName(this.connections.get(socket.id).name)
        ).id,
        data
      )) != 0
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
      (await this.channelService.setPassword(
        (
          await this.getClientDTOByName(this.connections.get(socket.id).name)
        ).id,
        data
      )) != 0
    ) {
      this.server.to(data.name).emit("setPassword", data);
    } else this.server.to(socket.id).emit("notAllowed", data);
  }

  // private getUserNameFromJWT(JWTtoken: string): DTO.DecodedToken {
  //   const decodedToken = this.jwtService.decode(JWTtoken) as DTO.DecodedToken;
  //   return decodedToken;
  // }

  private async connectUserToChannels(socket: Socket) {
    const client = await this.getClientDTOByName(
      this.connections.get(socket.id).name
    );
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
    user: DTO.Client
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
    this.connections.forEach((value: DTO.ConnectedClientInfo, key: string) => {
      if (value.name == user.name) {
        this.server.to(key).emit("joinedToChannel", channelInfo);
        this.server.sockets.sockets.get(key).join(channelIn.name);
      }
    });
  }

  private async disconnectUserFromChannels(user: DTO.Client) {
    (await this.userService.getChannels(user.id)).forEach((channelName) => {
      this.disconnectFromChannel(channelName, user);
    });
  }

  private async disconnectFromChannel(channelName: string, user: DTO.Client) {
    // notice users in channel about client disconnected
    this.server
      .to(channelName)
      .emit("userDisconnected", channelName, user.name);
  }

  private async onConnection(socket: Socket) {
    this.connections.set(socket.id, {
      name: socket.handshake.auth.username,
    });
    await this.userService.updateUser({
      where: {
        name: this.connections.get(socket.id).name,
      },
      data: {
        status: "ONLINE",
      },
    });
    //send to new user all channels
    let channels = await this.channelService.ChannelList();
    let channelList = [];
    channels.forEach((value: { name: string }) => {
      channelList.push({
        name: value.name,
      });
    });
    this.server.to(socket.id).emit("channels", channelList);

    //connect user to his channels
    this.connectUserToChannels(socket);
  }

  private async onDisconnecting(socket: Socket) {
    this.disconnectUserFromChannels(
      await this.getClientDTOByName(this.connections.get(socket.id).name)
    );
    const user = await this.userService.updateUser({
      where: {
        name: socket.handshake.auth.username,
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
    executor: DTO.Client,
    channel: ChannelEntity,
    channelIn: DTO.ChannelInfoIn,
    target: DTO.Client
  ): Promise<boolean> {
    return (
      channel == null ||
      channel.admIds.includes(executor.id) ||
      (!channel.isPrivate &&
        channel.password == channelIn.password &&
        !channel.bannedIds.includes(target.id))
    );
  }

  /////////// MUST BE DELETED !!!!!!!!!!!!!!!!!!!!!!!
  async getClientDTOByName(name: string): Promise<DTO.Client> {
    return await this.userService.getUserByName(name);
  }
}
