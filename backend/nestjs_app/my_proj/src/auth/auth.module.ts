import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ReqService } from 'src/req/req.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports:[UserModule, PassportModule, HttpModule, JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60s' },
  }),],
  providers: [AuthService, UserService, PrismaService, LocalStrategy, ReqService],
  exports: [AuthService],
})
export class AuthModule {}
