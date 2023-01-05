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

type Connections = Map<string, ConnectedClientInfo>;

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
    private connections: Connections = new Map()
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
    if (true) {
      this.server.on("connection", async (socket) => {
        console.log("connected", socket.id);
        console.log("connected", socket.handshake.auth.username);
        this.connections.set(socket.id, {
          username: socket.handshake.auth.username,
        });

        socket.on("disconnect", async () => {
          console.log("disconnected", socket.id);
          this.connections.delete(socket.id)
          socket.broadcast.emit("user connected", {
            userID: socket.id,
            username: this.connections.get(socket.id),
          });
        });
        //send to new user info about connected users
        let resp = [];
        this.connections.forEach((value: ConnectedClientInfo, key: string) => {
          resp.push({
            username: value.username,
            userID: key,
            conncected: true,
          });
          console.log(key, value);
        });
        socket.emit("users", resp);

        //send to connected users info about new user
        socket.broadcast.emit("user connected", {
          userID: socket.id,
          username: this.connections.get(socket.id),
        });
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
