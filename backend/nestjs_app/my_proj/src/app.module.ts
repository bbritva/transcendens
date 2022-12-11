import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from './req/req.service';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [HttpModule, GameModule, UserModule],
  controllers: [
    AuthController,
    AppController,
  ],
  providers: [AppService, ReqService],
})
export class AppModule {}
