import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  CreateMessageDTO,
  PrivateMessageDTO,
} from "src/chat/message/dto/create-message.dto";
import { MessageService } from "src/chat/message/message.service";
import { ClientDTO } from "./client.dto";
import { ChannelInfoDto } from "./channel.dto";
import { ConnectedClientInfo } from "./connectedClientInfo";
import { DecodedTokenDTO } from "./decodedToken.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "../channel/channel.service";

interface newSocket extends Socket {
  username: string;
}

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
    // have to check authorisation
    // pseudo auth!
    // this.server.use((socket: newSocket, next) => {
    //   const username = socket.handshake.auth.username;
    //   if (!username) {
    //     return next(new Error("invalid username"));
    //   }
    //   socket.username = username;
    //   next();
    // });
    if (true) {
      this.server.on("connection", async (socket) => {
        // logging
        console.log("connected", socket.id, socket.handshake.auth.username);
        this.connections.set(socket.id, {
          username: socket.handshake.auth.username,
        });

        //discinnection handler
        socket.on("disconnecting", async () => {
          console.log("disconnecting", socket.id);
          this.disconnectUserFromChannels(socket, this.connections.get(socket.id).username);
        });
        socket.on("disconnect", async () => {
          console.log("disconnected", socket.id);
          this.connections.delete(socket.id);
        });

        //send to new user all channels
        let channels = await this.channelService.ChannelList();
        let channelList = [];
        channels.forEach((value: { name: string }) => {
          channelList.push({
            channelName: value.name,
          });
        });
        socket.emit("channels", channelList);

        //connect user to his channels
        this.connectUserToChannels(socket);
      });
    } else this.server.close();
  }

  @SubscribeMessage("private message")
  async onPrivateMessage(
    @ConnectedSocket() client: ClientDTO,
    @MessageBody() data: PrivateMessageDTO
  ) {
    console.log("private", data);
    this.server.to(data.to).emit("private message", {
      content: data.content,
      from: client.id,
    });
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() client: ClientDTO,
    @MessageBody() data: CreateMessageDTO
  ) {
    console.log(this.connections[client.id]);
    console.log(data);
    console.log(this.connections);

    console.log(client);
    try {
      const messageOut = await this.messageService.createMessage({
        channel: {
          connect: { name: data.header.channel },
        },
        authorName: client.username,
        text: data.text,
      });
      this.server.to(data.header.channel).emit("onMessage", {
        header: {
          userName: messageOut.authorName,
          channel: messageOut.channelName,
          sentAt: messageOut.sentAt,
        },
        body: messageOut.text,
      });
    } catch (e) {
      console.log("err", e.meta.cause);
    }
  }

  @SubscribeMessage("connect to channel")
  async onConnectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: ChannelInfoDto
  ) {
    this.connectToChannel(socket, data.name);
  }

  private getUserNameFromJWT(JWTtoken: string): string {
    const decodedToken = this.jwtService.decode(JWTtoken) as DecodedTokenDTO;
    return decodedToken.username;
  }

  private async connectUserToChannels(socket: Socket) {
    const channels = await this.userService.getChannels(
      this.connections.get(socket.id).username
      // "Bob"
    );
    channels.forEach((channelName) => {
      this.connectToChannel(socket, channelName);
    });
  }

  private async connectToChannel(socket: Socket, channelName: string) {
    const user = await this.userService.getUserByName(
      this.connections.get(socket.id).username
      // "Bob"
    );
    const channel = await this.channelService.connectToChannel({
      name: channelName,
      ownerId: user.id,
    });
    // notice users in channel about new client
    this.server.to(channelName).emit("user connected", user.name);
    console.log("emitted to channel", channelName, ": +", user.name);

    // send to user channel info
    let channelInfo: ChannelInfoDto = {
      name: channelName,
      users: channel.guests,
      messages: channel.messages,
    };
    socket.emit("joined to channel", channelInfo);
    console.log("emitted to user", channelInfo);

    socket.join(channelName);
    console.log("user", user.name, "connected to", channelName, "room");
  }

  private async disconnectUserFromChannels(socket: Socket, userName : string) {
    (
      await this.userService.getChannels(
        userName
        // "Bob"
      )
    ).forEach((channelName) => {
      this.disconnectFromChannel(socket, channelName, userName);
    });
  }

  private async disconnectFromChannel(socket: Socket, channelName: string, userName: string) {
    // notice users in channel about client disconnected
    this.server.to(channelName).emit("user disconnected", userName);
    console.log("emitted to channel", channelName, ": -", userName);
  }
}
