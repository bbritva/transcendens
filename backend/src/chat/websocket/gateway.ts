import { OnModuleInit, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
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
import {
  ChannelInfoDtoIn,
  ChannelInfoDtoOut,
  ConnectedClientInfo,
  DecodedTokenDTO,
} from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { WsGuard } from "src/auth/jwt-auth.chat.guard";

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3001"],
  },
})
export class Gateway implements OnModuleInit {
  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    private userService: UserService,
    private channelService: ChannelService
  ) {}

  connections: Map<string, ConnectedClientInfo> = new Map();

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", async (socket) => this.tezd(socket));
  }

  @UseGuards(WsGuard)
  @SubscribeMessage("connection")
  async tezd(socket: Socket) {
    {
      // have to check authorisation
      let auth_token = socket.handshake.auth.username;
      console.log('auth token', auth_token);
      
      auth_token = auth_token.split(' ')[1];

      // event handler
      this.onConnection(socket);

      //disconnection handler
      socket.on("disconnecting", async () => {
        this.onDisconnecting(socket);
      });
      socket.on("disconnect", async () => {
      });
    }

  }
    
  @SubscribeMessage("connectToChannel")
  async connectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: ChannelInfoDtoIn
  ) {
    await this.connectUserToChannel(
      this.connections.get(socket.id).username,
      channelIn.name
    );
    channelIn.users.forEach(
      async (userName) =>
        await this.connectUserToChannel(userName.name, channelIn.name)
    );
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(@MessageBody() data: CreateMessageDTO) {
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

  private getUserNameFromJWT(JWTtoken: string): DecodedTokenDTO {
    const decodedToken = this.jwtService.decode(JWTtoken) as DecodedTokenDTO;
    return decodedToken;
  }

  private async connectUserToChannels(socket: Socket) {
    const channels = await this.userService.getChannels(
      this.connections.get(socket.id).username
      // "Bob"
    );

    channels.forEach((channelName) => {
      const channelInfoDtoIn: ChannelInfoDtoIn = {
        name: channelName,
        users: [{ name: this.connections.get(socket.id).username }],
      };
      this.connectToChannel(socket, channelInfoDtoIn);
    });
  }

  private async connectUserToChannel(userName: string, channelName: string) {
    const user = await this.userService.getUserByName(userName);
    const channel = await this.channelService.connectToChannel({
      name: channelName,
      ownerId: user.id,
    });
    // notice users in channel about new client
    this.server.to(channelName).emit("userConnected", channel.name, userName);

    // send to user channel info
    const channelInfo: ChannelInfoDtoOut = {
      name: channel.name,
      users: channel.guests,
      messages: channel.messages,
    };
    this.connections.forEach((value: ConnectedClientInfo, key: string) => {
      if (value.username == userName) {
        this.server.to(key).emit("joinedToChannel", channelInfo);
        this.server.sockets.sockets.get(key).join(channelName);
      }
    });
  }

  private async disconnectUserFromChannels(userName: string) {
    (await this.userService.getChannels(userName)).forEach((channelName) => {
      this.disconnectFromChannel(channelName, userName);
    });
  }

  private async disconnectFromChannel(channelName: string, userName: string) {
    // notice users in channel about client disconnected
    this.server.to(channelName).emit("userDisconnected", channelName, userName);
  }

  private async onConnection(socket: Socket) {
    this.connections.set(socket.id, {
      username: socket.handshake.auth.username,
    });
    await this.userService.updateUser({
      where: {
        name: this.connections.get(socket.id).username,
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
    this.disconnectUserFromChannels(this.connections.get(socket.id).username);
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
}
