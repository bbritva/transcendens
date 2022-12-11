
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
          ) : Promise<string> {
        // let accessToken = await getToken(accessCode, accessState);
        // let accessToken = await this.httpService.getToken(accessCode, accessState)
        let accessToken = 'f78f7d723908b46919b67bc4503c8918b446bcfda14e77d287cb46e6f8bd79f0';
        // console.log('OurToken!', accessToken.data);
        let user = await this.httpService.getMe(accessToken);
        // const tokenData = {id:token_type, expires_in ,refresh_token,scope ,created_at }
        const userData = {id: user.data.id, name: user.data.login}
        let res = await this.userService.getUser(userData.id);
        if (!res)
        {
          // console.log('usiki');
          res = await this.userService.createUser(userData); // return if user or not for front => to add tomorrow
        }
        // this.createToken(accessToken);
        console.log('res', res);
        console.log('User ', user.data.id);
        // console.log('User ', user.data.email);
        // console.log('User ', user.data.login);
        return accessToken;
    }
}
