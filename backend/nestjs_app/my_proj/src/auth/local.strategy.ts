import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ReqService } from 'src/req/req.service';
import { UserService } from 'src/user/user.service';
import { access } from 'fs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService,
    private readonly httpService: ReqService,
    private readonly userService: UserService,
) {
    super({usernameField: 'accessCode', passwordField: 'accessState'});
    // super();
  }

  async validate(accessCode: string, accessState: string): Promise<any> {
    console.log('Strategy accessCode', accessCode, accessState);
    let tokenResponse = await this.httpService.getToken(accessCode, accessState)
    //let tokenResponse = await this.httpService.getToken()

    const user = await this.authService.validateUser(tokenResponse.data.access_token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// super({ usernameField: 'email' })