import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AuthController } from 'src/auth/auth.controller';
import { ReqService } from 'src/req/req.service';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/token/token.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GatewayModule } from 'src/chat/websocket/gateway.module';
import { ChannelModule } from 'src/chat/channel/channel.module';
import { MessageService } from 'src/chat/message/message.service';

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
    PrismaModule, 
    // PassportModule, 
    // JwtModule.register({
    //   secret: jwtConstants.secret,
    //   signOptions: { expiresIn: '60s' },
    // })
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
    TokenService,
    MessageService,
  ],
})
export class AppModule {}
