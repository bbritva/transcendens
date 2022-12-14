import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';


@Module({
  imports: [HttpModule, GameModule, UserModule],
  controllers: [
    AppController,
  ],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
