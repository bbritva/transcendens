import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ReqService } from 'src/req/req.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService,
    private readonly httpService: ReqService,
) {
    super({usernameField: 'accessCode', passwordField: 'accessState'});
  }

  async validate(accessCode: string, accessState: string): Promise<any> {
    let tokenResponse = await this.httpService.getToken(accessCode, accessState)

    const user = await this.authService.validateUser(tokenResponse.data);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
} 