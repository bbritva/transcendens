import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Request,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/auth/constants';



@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }


    @Post('add')
    async signupUser(
        @Body() data: { id: number; name: string },
    ): Promise<UserModel> {
        const user = await this.userService.getUser(data.id)
        if (user === null) {
            return this.userService.createUser(data)
                .then(ret => ret)
                .catch(error => {
                    console.log("catch");
                    throw new BadRequestException(error.code);
                });
        }
        return user
    }

    @Post('setName')
    async setUserName(
        @Body() data: { id: number; name: string },
    ): Promise<UserModel> {
        return this.userService.updateUser({
            where: { id: Number(data.id) },
            data: { name: data.name },
        })
            .then(ret => {
                console.log("then");

                return ret;
            })
            .catch(error => {
                console.log("catch");
                throw new BadRequestException(error.code);
            });
    }

    @Get('getMe')
    async getMe(@Request() req) {
        console.log('REquest', req);
       return await this.userService.getUser(req.user.id);
    }

    @Get('show')
    async showUser(
        @Body('id') userId: number,
    ): Promise<UserModel> {
        return this.userService.getUser(userId);
    }
}
