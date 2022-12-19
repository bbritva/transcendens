import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

//services
import { AppService } from 'src/app.service';
import { AuthController } from 'src/auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from 'src/req/req.service';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from './prisma.service';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { TokenService } from './token/token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';


@Module({
  imports: [
    HttpModule, 
    GameModule, 
    UserModule, 
    AuthModule, 
    // PassportModule, 
    // JwtModule.register({
    //   secret: jwtConstants.secret,
    //   signOptions: { expiresIn: '60s' },
    // })
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
