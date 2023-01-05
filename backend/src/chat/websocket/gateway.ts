import { Body, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateMessageDTO, PrivateMessageDTO } from "src/chat/message/dto/create-message.dto";
import { MessageService } from "src/chat/message/message.service";
import { ClientDTO } from "./client.dto";
import { ConnectedClientInfo } from "./connectedClientInfo";
import { DecodedTokenDTO } from "./decodedToken.dto";
import { UserService } from 'src/user/user.service';
import { isError } from '@jest/expect-utils';

type Connections = {
  [key: string]: ConnectedClientInfo;
};

interface newSocket extends Socket{
  username: string
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
    private connections: Connections = {}
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    // have to check authorisation
    // pseudo auth!
    this.server.use((socket: newSocket, next) => {
      const username = socket.handshake.auth.username;
      if (!username) {
        return next(new Error("invalid username"));
      }
      socket.username = username;
      next();
    });
    if (true){
      this.server.on("connection", async (socket) => {
        console.log('connected', socket.id);
        console.log('connected', socket.handshake.auth.username);
        this.connections[socket.id] = socket.handshake.auth.username;
        const users = await this.userService.users({})
        let resp = [];
        for (let [id , socket ] of this.server.of("/").sockets) {
          resp.push({
            //@ts-ignore
            username: socket.username,
            userID: id,
            conncected: true,
        });

        }
        socket.emit("users", resp);
      });
      this.server.on("connection", (socket: newSocket) => {
        // notify existing users
        socket.broadcast.emit("user connected", {
          userID: socket.id,
          username: socket.username,
        });
      });
    }
    else this.server.close();
  }

  @SubscribeMessage('private message')
  async onPrivateMessage(@ConnectedSocket() client: ClientDTO, @MessageBody() data: PrivateMessageDTO) {
    console.log("private", data)
    this.server.to(data.to).emit("private message", {
      content: data.content,
      from: client.id,
    });
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(@ConnectedSocket() client: ClientDTO, @MessageBody() data: CreateMessageDTO) {
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
