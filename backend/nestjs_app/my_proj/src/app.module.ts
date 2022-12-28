import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';

//services
import { AppService } from 'src/app.service';
import { AuthController } from 'src/auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from 'src/req/req.service';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/token/token.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Module({
  imports: [
    HttpModule, 
    GameModule, 
    UserModule, 
    AuthModule,
  ],
  controllers: [
    AuthController,
    AppController,
  ],
  providers: [
    AppService, 
    ReqService, 
    PrismaService, 
    UserService, 
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
