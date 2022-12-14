import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.getUserByName(username);
        console.log(user);
        
        // if (user && user.token === pass) {
        //   const { password, ...result } = user;
        //   return result;
        // }
        return null;
      }
}
