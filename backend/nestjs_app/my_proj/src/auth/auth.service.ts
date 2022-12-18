import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { ReqService } from 'src/req/req.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
                private readonly httpService: ReqService,
                private jwtService: JwtService) {}

    async validateUser(accessToken: string): Promise<any> {
        let userResponse = await this.httpService.getMe(accessToken);
        console.log('validateUser ', userResponse.data);
        
        if (userResponse?.data) {
          const userData = {id: userResponse.data.id, name: userResponse.data.login, image: userResponse.data.link}
          return userData;
        }
        return null;
      }

      async login(user: any) {
        const payload = { id: user.id, username: user.name, sub: user.image };
        const res = this.getTokens(payload);
        const dbResponse = await this.updateRefreshTokenDb(user.name, res.refreshToken)
        console.log("Response DB", dbResponse)
        return res;
      }

      async updateRefreshTokenDb(username: string, refreshToken: string) {
        const res = await this.userService.updateUser({
          where: {name: username},
          data: {refreshToken: refreshToken}
        });
        return res;
      }

      getTokens(payload:{id: number, username: string, sub: string}) {
        const tokens = {
          access_token: this.jwtService.sign(payload),
          refreshToken: this.jwtService.sign(
            payload,
            {
              secret: env.JWT_REFRESH_SECRET,
              expiresIn: '7d',
            },
        )};
        return tokens;
      }

      refresh

    }    