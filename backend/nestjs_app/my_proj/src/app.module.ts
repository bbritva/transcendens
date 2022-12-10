import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { GameService } from './game/game.service';
import { PrismaService } from './prisma.service';
import { GameController } from './game/game.controller';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from './req/req.service';


@Module({
  imports: [HttpModule],
  controllers: [
    GameController,
    UserController,
    AuthController,
    AppController,
  ],
  providers: [PrismaService, AppService, UserService, GameService, ReqService],
})
export class AppModule {}
