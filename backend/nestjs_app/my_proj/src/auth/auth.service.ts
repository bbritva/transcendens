import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    console.log('validateUser ', userResponse.data);

    if (userResponse?.data) {
      const userData = {
        id: userResponse.data.id,
        name: userResponse.data.login,
        image: userResponse.data.link,
      };
      return userData;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.image };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
