import { CanActivate, Injectable } from "@nestjs/common";
import { env } from "process";
import { UserService } from "src/user/user.service";
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService) 
    
    {
}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable <boolean | any> {
    console.log('can activate', context.args[0].handshake.auth.username);
    
    const token = context.args[0].handshake.auth.username.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, 
        { secret: env.JWT_ACCESS_SECRET}) as any;
      return new Promise((resolve, reject) => {
        return this.userService.getUserByName(decoded.username).then(user => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });

      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}