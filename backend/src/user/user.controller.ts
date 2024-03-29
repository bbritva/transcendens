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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User as UserModel } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UserEntity } from "./entities/user.entity";
import { GetMeUserDto } from "./dto/getMeUser.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "crypto";
import * as path from "path";
import { ManageUserI } from "src/chat/websocket/websocket.dto";
import { Public } from "src/auth/constants";


export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};

export const storage = {
  storage: diskStorage({
    destination: "./uploads/avatars",
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, "") + randomUUID();
      const extention: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extention}`);
    },
  }),
  fileFilter: imageFileFilter,
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
  async getMe(@Request() req: GetMeUserDto): Promise<UserModel> {
    return this.userService
      .getUser(req.user.id)
      .then((user) => {
        return user;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  @ApiOkResponse()
  @Get("ladder")
  async getLadder(): Promise<UserModel[]> {
    return this.userService
      .getLadder()
      .then((users) => users)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  @ApiOkResponse()
  @Get("checkNamePossibility")
  async checkNamePossibility(@Request() req: ManageUserI): Promise<boolean> {
    return this.userService
      .getUserByName(req.targetUserName)
      .then((user) => {
        return !user;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  @ApiOkResponse({ type: UserEntity })
  @Get("stats/:id")
  async getStats(@Param("id") id: string): Promise<UserModel> {
    return this.userService
      .getStats(parseInt(id))
      .then((user) => user)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  @ApiOkResponse({ type: UserEntity })
  @Get(":id")
  async showUser(@Param("id") id: string): Promise<UserModel> {
    return this.userService
      .getUser(parseInt(id), true, true)
      .then((user) => {
        return user;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", storage))
  uploadFile(@Request() req: GetMeUserDto, @UploadedFile() file): Object {
    this.userService.updateUser({
      where: {
        id: req.user.id,
      },
      data: {
        avatar: file.filename,
      },
    });
    return { avatar: file.filename };
  }

  @Public()
  @Get("avatar/:avatarname")
  findAvatar(@Param("avatarname") avatarname, @Res() res): Promise<any> {
    return res.sendFile(
      path.join(process.cwd(), "uploads/avatars/" + avatarname)
    );
  }
}
