import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
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
    private channelService : ChannelService
  ) {}

  connections: Map<string, ConnectedClientInfo> = new Map()

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
        });
        socket.on("disconnect", async () => {
          console.log("disconnected", socket.id);
          this.connections.delete(socket.id)
        });

        //send to new user all channels
        let channels = await this.channelService.ChannelList();
        let channelList = [];
        channels.forEach((value: {name : string}) => {
          channelList.push({
            channelName: value.name,
          });
        });
        socket.emit("channels", channelList);

        //connect user to his channels

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

    // console.log(client);
    // try {
    //   const messageOut = await this.messageService.createMessage({
    //     channel: {
    //       connect: { name: messageIn.header.channel },
    //     },
    //     authorName: socket.username,
    //     text: messageIn.text,
    //   });
    //   this.server.emit('onMessage', {
    //     header: {
    //       userName: messageOut.authorName,
    //       channel: messageOut.channelName,
    //       sentAt: messageOut.sentAt,
    //     },
    //     body: messageOut.text,
    //   });
    // } catch (e) {
    //   console.log("err", e.meta.cause);
    // }
  }

  private getUserNameFromJWT(JWTtoken: string): string {
    const decodedToken = this.jwtService.decode(JWTtoken) as DecodedTokenDTO;
    return decodedToken.username;
  }
}
