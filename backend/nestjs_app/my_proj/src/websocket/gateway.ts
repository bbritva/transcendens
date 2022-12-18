import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from 'src/channel/message/message.service';

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

  // {
  //     header : {
  //       user,
  //       channel(or direction)
  //     },
  //     body: {
  //       message
  //     }
  // }

  @SubscribeMessage('newMessage')
  async onNewMessage(@MessageBody() body: any) {
    console.log(body);
    const msg = await this.messageService.createMessage({
      channel: {
        connect: { name: body.header.channel },
      },
      authorName: body.header.user,
      text: body.message,
    });
    this.server.emit('onMessage', {
      header: {
        user: msg.authorName,
        channel: msg.channelName,
        sentAt: msg.sentAt,
      },
      body: msg.text,
    });
  }
}
