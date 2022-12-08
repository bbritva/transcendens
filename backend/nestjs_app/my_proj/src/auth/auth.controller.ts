import { Controller, Get, Param } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    @Get(':authCode')
    getAuth(@Param('authCode') authCode: string): string {
        let accessToken = 'Token';
        return accessToken;  
    }


}

