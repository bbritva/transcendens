import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Module({
  imports:[UserModule],
  providers: [AuthService, UserService, PrismaService]
})
export class AuthModule {}
