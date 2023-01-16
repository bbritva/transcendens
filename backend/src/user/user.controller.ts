import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Request,
  BadRequestException,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { GetMeUserDto } from './dto/getMeUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

export const storage = {
  storage: diskStorage({
    destination: "./uploads/avatars",
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, "") + randomUUID();
      const extention: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extention}`);
    },
  }), //...
};

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("add")
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

  @Patch("setName")
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
    description: "Request body",
    required: true,
    type: GetMeUserDto,
  })
  @ApiOkResponse({ type: UserEntity })
  @Get("getMe")
  async getMe(@Request() req: GetMeUserDto) {
    // async getMe( @Body() req : GetMeUserDto) {
    return await this.userService.getUser(req.user.id);
  }

  @ApiOkResponse({ type: UserEntity })
  @Get(":id")
  async showUser(@Param("id") id: number): Promise<UserModel> {
    return this.userService.getUser(id);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", storage))
  uploadFile(
    @Request() req: GetMeUserDto,
    @UploadedFile() file
  ): Object {
    this.userService.updateUser({
      where: {
        id: req.user.id,
      },
      data: {
        avatar: file.filename,
      },
    });
    return ({ avatar: file.filename });
  }

  @Get('avatar/:avatarname')
  findAvatar(@Param('avatarname') avatarname, @Res() res): Promise<any> {
    return res.sendFile(path.join(process.cwd(), 'uploads/avatars/' + avatarname));
  }
}
