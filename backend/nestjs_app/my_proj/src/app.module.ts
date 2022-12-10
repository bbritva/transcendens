import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from './req/req.service';


@Module({
  imports: [HttpModule],
  controllers: [
    AppController,
    AuthController
  ],
  providers: [PrismaService, AppService, UserService, ReqService],
})
export class AppModule {}
