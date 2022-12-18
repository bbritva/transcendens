import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageDto } from 'src/chat/message/message.dto';
import { MessageService } from 'src/chat/message/message.service';

@WebSocketGateway()
export class Gateway implements OnModuleInit {
  constructor(private messageService: MessageService) {}

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
  async onNewMessage(@MessageBody() messageIn: MessageDto) {
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
    return JWTtoken;
  }
}
