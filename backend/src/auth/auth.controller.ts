import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { RefreshTokenGuard } from 'src/auth/jwt-auth.refresh.guard';
import { Public } from 'src/auth/constants';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthRefreshTokenDto, AuthLoginDto } from './dto/authRequest.dto';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({
    description: 'Request body',
    required: true,
    type: AuthLoginDto,
  })
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/')
  async login(@Res({ passthrough: true }) res: Response, @Request() req : AuthLoginDto) {
    if (req.user.isTwoFaEnabled){
      res.status(HttpStatus.I_AM_A_TEAPOT).send({username: req.user.name});
      return ;
    }
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
  async register(@Res() res, @Request() req) {
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

  @Public()
  @Post('2fa/auth')
  async authenticate(@Request() req, @Body() body) {
    console.log({body});
      const user = await this.userService.getUserByName(body.user);
    console.log({user});
      const isCodeValid = await this.authService.isTwoFaCodeValid(
        body.twoFaCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const res =  await this.authService.loginWith2Fa(user);
    return res;
  }

}
