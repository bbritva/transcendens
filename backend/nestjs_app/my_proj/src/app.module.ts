import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { AppController } from 'src/app.controller';

//services
import { AuthController } from './auth/auth.controller';
import { ReqService } from 'src/req/req.service';

import { AppService } from 'src/app.service';
import { GatewayModule } from 'src/websocket/gateway.module';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChannelModule } from 'src/channel/channel.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/token/token.service';
import { MessageService } from 'src/channel/message/message.service';

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
    GatewayModule,
    ChannelModule,
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
    TokenService, MessageService,
  ],
})
export class AppModule {}
