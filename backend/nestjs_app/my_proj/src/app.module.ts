import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [HttpModule, GameModule, UserModule],
  controllers: [
    AppController,
  ],
  providers: [AppService],
})
export class AppModule {}
