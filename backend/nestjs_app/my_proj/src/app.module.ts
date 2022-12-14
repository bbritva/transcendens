import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat2/chat2.module';

process.on('warning', (warning) => {
  console.log(warning.stack);
});

@Module({
  imports: [HttpModule, GameModule, UserModule, ChatModule],
  controllers: [
    AppController,
  ],
  providers: [AppService],
})
export class AppModule {}
