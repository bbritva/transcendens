
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReqService } from 'src/req/req.service';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly httpService: ReqService,
    private readonly userService: UserService
  ) {}

    @Get('/')
        async getAuth(
          @Query('accessCode') accessCode: string,
          @Query('accessState') accessState: string,
          ) : Promise<{}> {
        let tokenResponse = await this.httpService.getToken(accessCode, accessState)
        let newUser = false;
        console.log('OurToken!', tokenResponse.data);
        let userResponse = await this.httpService.getMe(tokenResponse.data.access_token);
        const tokenData = {
          access_token: tokenResponse.data.access_token,
          token_type: tokenResponse.data.token_type,
          expires_in: tokenResponse.data.expires_in,
          refresh_token: tokenResponse.data.refresh_token,
          scope: tokenResponse.data.scope,
          created_at: tokenResponse.data.created_at
        }
        const userData = {id: userResponse.data.id, name: userResponse.data.login, image: userResponse.data.image.link}
        let res = await this.userService.getUser(userData.id);
        if (!res)
        {
          res = await this.userService.createUser(userData);
          newUser = true;
        }
        // this.createToken(accessToken);
        console.log('res', newUser, res);
        console.log('image', userResponse.data.image.link);
        // console.log('User ', userResponse.data.id);
        // console.log('User ', user.data.email);
        // console.log('User ', user.data.login);
        return {tokenData, userData, newUser};
    }
}

