import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReqService {
    constructor(private readonly httpService: HttpService,
        private prisma: PrismaService) { }

    getToken = async (accessCode: string, accessState: string): Promise<AxiosResponse> => {
        const body = {
            grant_type: 'authorization_code',
            client_id: env.CLIENT_ID,
            client_secret: env.SECRET,
            code: accessCode,
            redirect_uri: env.REDIRECT_URI,
            state: accessState
        }
        const response = this.httpService.axiosRef.post(env.TOKENENDPOINT, body);
        return response;
    }

    getMe = async (accessToken: string) : Promise<AxiosResponse> => {
        const response = this.httpService.axiosRef.get("https://api.intra.42.fr/v2/me", {headers:{Authorization: `Bearer ${accessToken}`}});
        const res = response
            .then(data => data)
            .catch(error => {
                return error;
            });
        return res;
    }
}

