import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from './app.service';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';


@Module({
  imports: [],
  controllers: [
    AppController,
    AuthController
  ],
  providers: [PrismaService, AppService, UserService],
})
export class AppModule {}
