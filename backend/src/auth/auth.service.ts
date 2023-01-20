import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { env } from 'process';
import { ReqService } from 'src/req/req.service';
import { intraTokenDto } from 'src/token/intraToken.dto';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly httpService: ReqService,
    private jwtService: JwtService,
    private tokenService: TokenService
  ) {}

  async validateUser(accessTokenData: intraTokenDto): Promise<any> {
    let userResponse = await this.httpService.getMe(accessTokenData.access_token);
    if (userResponse?.data) {
      const userData = {
        id: parseInt(userResponse.data.id),
        name: userResponse.data.login,
        image: userResponse.data.image.link,
        channels : {
          connect : {
            name : "main"
          }
        }
      };
      let userBd = await this.userService.getUser(userData.id);
      if (!userBd) {
        userBd = await this.userService.createUser(userData);
        const tokenBd = await this.tokenService.createToken({
          owner: {
            connect: {id: userBd.id}
          },
          ...accessTokenData
        });
      }
      return userData;
    }
    return null;
  }

  async login(user: any, isTwoFactorAuthenticated = false) {
    const payload = { 
      id: user.id,
      username: user.name,
      isTwoFaEnabled: !!user.isTwoFaEnabled,
      isTwoFactorAuthenticated,
    };
    const res = this.getTokens(payload);
    const dbResponse = await this.updateRefreshTokenDb(
      user.name,
      res.refreshToken,
    );
    return res;
  }
  
  async loginWith2Fa(user: any) {
    const payload = { 
      id: user.id,
      username: user.name,
      isTwoFaEnabled: !!user.isTwoFaEnabled,
      isTwoFactorAuthenticated: true,
    };
    const res = this.getTokens(payload);
    const dbResponse = await this.updateRefreshTokenDb(
      user.name,
      res.refreshToken,
    );
    return res;
  }

  async logout(user: { id: number; name: string }) {
    const res = await this.userService.updateUser({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    return res;
  }

  getTokens(payload: { id: number; username: string }) {
    const tokens = {
      access_token: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    };
    return tokens;
  }

  async updateRefreshTokenDb(username: string, refreshToken: string) {
    const res = await this.userService.updateUser({
      where: { name: username },
      data: { refreshToken: refreshToken },
    });
    return res;
  }

  async refreshTokens(username: string, refreshToken: string) {
    const user = await this.userService.getUserByName(username);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = refreshToken.localeCompare(user.refreshToken);
    if (refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const payload = { id: user.id, username: user.name, sub: user.image };
    const tokens = this.getTokens(payload);
    await this.updateRefreshTokenDb(user.name, tokens.refreshToken);
    return tokens;
  }

  async generateTwoFaSecret(user: {id: number, name:string})
  {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.name, 'AUTH_APP_NAME', secret)
    await this.setTwoFaSecret(secret, user.id);
    return {
      secret,
      otpauthUrl
    }
  }

  async setTwoFaSecret(secret: string, userId: number) {
    const res = await this.userService.updateUser({
      where: { id: userId },
      data: { twoFaSecret: secret },
    });
    return res;
  }

  async generateQrCodeDataURL(otpauthUrl: string) {
    return toDataURL(otpauthUrl);
  }

  async turnOnTwoFa(userId: number) {
    let is2FA = true; 
    const res = await this.userService.updateUser({
      where: { id: userId },
      data: { isTwoFaEnabled: is2FA },
    });
    return res;
  }

  isTwoFaCodeValid(twoFaCodeCode: string, user: any) { //to check
    return authenticator.verify({
      token: twoFaCodeCode,
      secret: user.twoFaSecret,
    });
  }
}