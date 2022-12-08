import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';


@Module({
  imports: [],
  controllers: [
    AppController
  ],
  providers: [PrismaService, AppService, UserService, PostService],
})
export class AppModule {}
