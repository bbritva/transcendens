import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel} from '@prisma/client';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user')
  async signupUser(
    @Body('name') userName: string,
  ): Promise<UserModel> {
    let user = await this.userService.getUser(userName)
    console.log(user);
    
    if (user === null)
      return this.userService.createUser({name : userName});
    return user
  }

}