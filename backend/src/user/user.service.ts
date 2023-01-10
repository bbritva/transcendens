import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User, Prisma } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user
      .create({
        data,
      })
      .then((ret) => ret)
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            console.log(
              "There is a unique constraint violation, a user cannot be updated"
            );
          }
        }
        throw e;
      });
  }

  async getUserByName(userName: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        name: userName,
      },
      include: {
        channels : true
      }
    });
  }

  async getUser(userId: number): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        wins: true,
        loses: true,
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user
      .update({
        data,
        where,
      })
      .then((ret) => ret)
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            console.log(
              "There is a unique constraint violation, a user cannot be updated"
            );
          }
        }
        throw e;
      });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async getChannels(userName: string): Promise<string[]> {
    let channelList = [];
    const user = await this.prisma.user.findUnique({
      where: { name: userName },
      include: { channels: true },
    });
    if (user)
      user.channels.forEach((channel) => {
        channelList.push(channel.name);
      });
    return channelList;
  }
}
