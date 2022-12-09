import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user.service';
import { GameService } from './game.service';
import { PrismaService } from './prisma.service';


@Module({
  imports: [],
  controllers: [
    AppController
  ],
  providers: [PrismaService, AppService, UserService, GameService],
})
export class AppModule {}
