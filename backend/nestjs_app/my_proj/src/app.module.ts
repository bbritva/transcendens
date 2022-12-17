import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';

//services
import { AuthController } from './auth/auth.controller';
import { ReqService } from './req/req.service';

import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat2/chat2.module';
import { PrismaService } from './prisma.service';
import { UserService } from './user/user.service';
import { ChannelModule } from './channel/channel.module';
import { AuthModule } from './auth/auth.module';
import { TokenService } from './token/token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { JwtStrategy } from './auth/jwt.strategy';

// puts warnings to console
process.on('warning', (warning) => {
  console.log(warning.stack);
});

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
  imports: [HttpModule, GameModule, UserModule, ChatModule, ChannelModule],
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
    // JwtStrategy
  ],
})
export class AppModule {}
