import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Request,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { GetMeUserDto } from './dto/getMeUser.dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  @ApiOkResponse({ type: UserEntity })
  async addUser(@Body() data: CreateUserDto): Promise<UserModel> {
    const user = await this.userService.getUser(data.id);
    if (user === null) {
      return this.userService
        .createUser(data)
        .then((ret) => ret)
        .catch((error) => {
          throw new BadRequestException(error.code);
        });
    }
    return user;
  }

  @Patch('setName')
  @ApiOkResponse({ type: UserEntity })
  async setUserName(@Body() data: CreateUserDto): Promise<UserModel> {
    return this.userService
      .updateUser({
        where: { id: Number(data.id) },
        data: { name: data.name },
      })
      .then((ret) => {
        return ret;
      })
      .catch((error) => {
        throw new BadRequestException(error.code);
      });
  }

  @ApiBody({
    description: 'Request body',
    required: true,
    type: GetMeUserDto,
  })
  @ApiOkResponse({ type: UserEntity })
  @Get('getMe')
    async getMe( @Request() req : GetMeUserDto) {
       return await this.userService.getUser(req.user.id);
    }


  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  async showUser(@Param('id') id: number): Promise<UserModel> {
    return this.userService.getUser(id, true, true);
  }
}
