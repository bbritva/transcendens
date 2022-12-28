import {
  Controller,
  Get,
  Post,
  Request,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { RefreshTokenGuard } from 'src/auth/jwt-auth.refresh.guard';
import { Public } from 'src/auth/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Request() req) {
    return this.authService.refreshTokens(req.user, req.refreshToken);
  }
}
