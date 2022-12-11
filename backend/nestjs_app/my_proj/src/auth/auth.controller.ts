
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReqService } from 'src/req/req.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly httpService: ReqService
  ) {}

    @Get('/')
        async getAuth(
          @Query('accessCode') accessCode: string,
          @Query('accessState') accessState: string,
          ) : Promise<string> {
        // let accessToken = await getToken(accessCode, accessState);
        let accessToken = await this.httpService.getToken(accessCode, accessState)
        console.log('OurToken!', accessToken.data);
        let user = await this.httpService.getMe(accessToken.data.accessToken);
        console.log('User ', user);
        return accessToken.data;
    }
}
