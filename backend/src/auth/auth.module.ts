import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ReqService } from 'src/req/req.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtRefreshStrategy } from 'src/auth/jwt-refresh.strategy';
import { env } from 'process';
import { TokenService } from 'src/token/token.service';

@Module({
  imports:[UserModule, PassportModule, HttpModule, JwtModule.register({
    secret: env.JWT_ACCESS_SECRET, signOptions: { expiresIn: '6s' },
  })],
  providers: [
    AuthService, 
    UserService, 
    PrismaService, 
    LocalStrategy, 
    ReqService, 
    JwtStrategy,
    JwtRefreshStrategy,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
