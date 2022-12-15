import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async validateUser(username: string, token: string): Promise<any> {
        const user = await this.userService.getUserByName(username);
        // console.log(user);
        
        // if (user && this.tokenService.getToken === pass) {
        //   const { password, ...result } = user;
        //   return result;
        // }
        // return null;
      }
} // toekn instead of pass in this function and make a request to api intra with this token - check if threre is token or not = > empty string or not  

