import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';

//services
import { AppService } from 'src/app.service';
import { AuthController } from 'src/auth/auth.controller';
import { ReqService } from 'src/req/req.service';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/token/token.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GatewayModule } from 'src/chat/websocket/gateway.module';
import { ChannelModule } from 'src/chat/channel/channel.module';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';

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
    AuthModule,
    GatewayModule,
    ChannelModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [
    AuthController,
    AppController,
  ],
  providers: [
    AppService, 
    ReqService, 
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
