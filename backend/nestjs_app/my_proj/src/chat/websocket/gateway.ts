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
    const messageOut = await this.messageService.createMessage({
      channel: {
        connect: { name: messageIn.header.channel },
      },
      authorName: messageIn.header.JWTtoken,
      text: messageIn.text,
    });
    this.server.emit('onMessage', {
      header: {
        user: messageOut.authorName,
        channel: messageOut.channelName,
        sentAt: messageOut.sentAt,
      },
      body: messageOut.text,
    });
  }
}
