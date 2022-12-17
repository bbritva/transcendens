import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ReqService } from 'src/req/req.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports:[UserModule, PassportModule, HttpModule, JwtModule.register({
    secret: jwtConstants.secret, 
    //will be reactivated when the fresh token method is implemented
    // signOptions: { expiresIn: '60s' },
  })],
  providers: [
    AuthService, 
    UserService, 
    PrismaService, 
    LocalStrategy, 
    ReqService, 
    JwtStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
