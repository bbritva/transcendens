import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { ReqService } from 'src/req/req.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly httpService: ReqService,
    private jwtService: JwtService,
  ) {}

  async validateUser(accessToken: string): Promise<any> {
    let userResponse = await this.httpService.getMe(accessToken);
    if (userResponse?.data) {
      const userData = {
        id: parseInt(userResponse.data.id),
        name: userResponse.data.login,
        image: userResponse.data.link,
      };
      return userData;
    }
    return null;
  }

  async login(user: any) {
    const payload = { id: user.id, username: user.name };
    const res = this.getTokens(payload);
    const dbResponse = await this.updateRefreshTokenDb(
      user.name,
      res.refreshToken,
    );
    console.log('Response DB', dbResponse);
    return res;
  }

  async logout(user: {id: number, username: string}) {
    const res = await this.userService.updateUser({
      where: { name: user.username },
      data: { refreshToken: null },
    });
    return res;
  }

  getTokens(payload: { id: number; username: string}) {
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
    const refreshTokenMatches = refreshToken === user.refreshToken;
    if (!refreshTokenMatches) 
      throw new ForbiddenException('Access Denied');
    const payload = { id: user.id, username: user.name, sub: user.image };
    const tokens = this.getTokens(payload);
    await this.updateRefreshTokenDb(user.name, tokens.refreshToken);
    return tokens;
  }
}
