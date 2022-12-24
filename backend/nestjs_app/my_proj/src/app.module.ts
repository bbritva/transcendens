import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { AppController } from 'src/app.controller';

//services
import { AppService } from 'src/app.service';
import { AuthController } from 'src/auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ReqService } from 'src/req/req.service';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenService } from './token/token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';

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
    PrismaService, 
    UserService, 
    TokenService, MessageService,
  ],
})
export class AppModule {}
