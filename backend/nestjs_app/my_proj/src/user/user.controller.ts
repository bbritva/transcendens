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
import { User as UserModel } from '@prisma/client';



@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }


    @Post('add')
    async signupUser(
        @Body('name') userName: string,
    ): Promise<UserModel> {
        let user = await this.userService.getUserByName(userName)
        if (user === null)
            return this.userService.createUser({ name: userName });
        return user
    }

    @Get('show')
    async showUser(
        @Body('id') userId: number,
    ): Promise<UserModel> {
        return this.userService.getUser(userId);
    }
}
