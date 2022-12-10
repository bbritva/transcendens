import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { GameService } from './game/game.service';
import { PrismaService } from './prisma.service';
import { GameController } from './game/game.controller';
import { UserController } from './user/user.controller';


@Module({
  imports: [],
  controllers: [
    AppController,
    GameController,
    UserController
  ],
  providers: [PrismaService, AppService, UserService, GameService],
})
export class AppModule {}
