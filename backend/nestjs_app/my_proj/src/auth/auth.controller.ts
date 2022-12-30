import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { RefreshTokenGuard } from 'src/auth/jwt-auth.refresh.guard';
import { Public } from 'src/auth/constants';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthRefreshTokenDto, AuthLoginDto } from './dto/authRequest.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @ApiBody({
    description: 'Request body',
    required: true,
    type: AuthLoginDto,
  })
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/')
  async login(@Request() req : AuthLoginDto) {
    return this.authService.login(req.user);
  }

  @ApiBody({
    description: 'Request body',
    required: true,
    type: AuthLoginDto,
  })
  @Get('logout')
  logout(@Request() req : AuthLoginDto) {
    return this.authService.logout(req.user);
  }


  @ApiBody({
    description: 'Request body',
    required: true,
    type: AuthRefreshTokenDto,
  })
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Request() req : AuthRefreshTokenDto) {
    return this.authService.refreshTokens(req.user.username, req.user.refreshToken);
  }
}
