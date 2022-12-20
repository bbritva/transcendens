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
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  @ApiOkResponse({ type: UserEntity })
  async addUser(@Body() data: CreateUserDto): Promise<UserModel> {
    const user = await this.userService.getUser(data.id);
    if (user === null) {
      return await this.userService
        .createUser(data)
        .then((ret) => ret)
        .catch((error) => {
          console.log('catch');
          throw new BadRequestException(error.code);
        });
    }
    return user;
  }

  @Patch('setName')
  @ApiOkResponse({ type: UserEntity })
  async setUserName(@Body() data: UpdateUserDto): Promise<UserModel> {
    return this.userService
      .updateUser({
        where: { id: Number(data.id) },
        data: { name: data.name },
      })
      .then((ret) => {
        console.log('then');
        return ret;
      })
      .catch((error) => {
        console.log('catch');
        throw new BadRequestException(error.code);
      });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserEntity })
  @Get('getMe')
  async getMe(@Request() req) {
    const pupa = await this.userService.getUser(req.user.id);
    console.log('pupa ', pupa);
    return pupa;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserEntity })
  @Get(':id')
  async showUser(@Param('id') id: number): Promise<UserModel> {
    return this.userService.getUser(id);
  }
}
