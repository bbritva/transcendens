import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UnauthorizedException,
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

  @Post('2fa/generate')
  async register(@Response() res, @Request() req) {
    const { otpauthUrl } =
      await this.authService.generateTwoFaSecret(
        req.user,
      );

    return res.json(
      await this.authService.generateQrCodeDataURL(otpauthUrl),
    );
  }

  @Post('2fa/turn-on')
  async turnOnTwoFa(@Request() req) {
    return this.authService.turnOnTwoFa(req.user.id);
  }

  @Post('2fa/auth')
  async authenticate(@Request() req, @Body() body) {
    const isCodeValid = await this.authService.isTwoFaCodeValid(
      body.twoFaCode,
      req.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const res =  await this.authService.loginWith2Fa(req.user);
    return res;
  }

}
