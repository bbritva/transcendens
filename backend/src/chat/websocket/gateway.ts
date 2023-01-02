import { Body, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateMessageDto } from 'src/chat/message/dto/create-message.dto';
import { MessageService } from 'src/chat/message/message.service';
import { ClientDTO } from './client.dto';
import { DecodedTokenDTO } from './decodedToken.dto';

type Connections = {
  [key: string]: number;
};

@WebSocketGateway()
export class Gateway implements OnModuleInit {

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    private connections: Connections = {}
  ) { }



  @WebSocketServer()
  server: Server;

  onModuleInit() {
    // have to check authorisation
    if (true)
      this.server.on('connection', (socket) => {
        console.log('connected', socket.id);
        console.log('connected', socket.handshake.headers);
        // this.connections[socket.id] = socket.handshake.headers.length
      });
    else this.server.close();
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(@ConnectedSocket() client: ClientDTO, @MessageBody() data: CreateMessageDto) {
    console.log(client.id);
    console.log(client.username);
    console.log(data);
    console.log(client);
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
