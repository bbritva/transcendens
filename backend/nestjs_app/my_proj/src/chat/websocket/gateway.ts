import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CreateMessageDto } from 'src/chat/message/dto/create-message.dto';
import { MessageService } from 'src/chat/message/message.service';

@WebSocketGateway()
export class Gateway implements OnModuleInit {
  constructor(
    private messageService: MessageService,
    private jwtService: JwtService
    ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    // have to check authorisation
    if (true)
      this.server.on('connection', (socket) => {
        console.log('connected', socket.id);
      });
    else this.server.close();
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(@MessageBody() messageIn: CreateMessageDto) {
    console.log(messageIn);
    try {
      const messageOut = await this.messageService.createMessage({
        channel: {
          connect: { name: messageIn.header.channel },
        },
        authorName: this.getUserNameFromJWT(messageIn.header.JWTtoken),
        text: messageIn.text,
      });
      this.server.emit('onMessage', {
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

  private getUserNameFromJWT(JWTtoken : string) : string {
    const user = this.jwtService.decode(JWTtoken);
    console.log(user);
    
    return JWTtoken;
  }
}
