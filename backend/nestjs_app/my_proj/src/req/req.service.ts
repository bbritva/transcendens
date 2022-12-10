import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { env } from 'process';

@Injectable()
export class ReqService {
    constructor(private readonly httpService: HttpService) { }

    getToken = async (accessCode: string, accessState: string): Promise<AxiosResponse> => {
        const data = {
            grant_type: 'authorization_code',
            client_id: env.CLIENT_ID,
            client_secret: env.SECRET,
            code: accessCode,
            redirect_uri: env.REDIRECT_URI,
            state: accessState
        }
        console.log('getToken_data', JSON.stringify(
            data
        ));
        const response = this.httpService.axiosRef.post(env.TOKENENDPOINT, {...data})

        return response;
    }
}

