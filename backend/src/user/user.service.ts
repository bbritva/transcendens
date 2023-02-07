import { BadRequestException, Injectable } from "@nestjs/common";
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
    return this.prisma.user
      .findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
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
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getUserByName(userName: string): Promise<User> {
    return this.prisma.user
      .findUnique({
        where: {
          name: userName,
        },
        include: {
          channels: true,
        },
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getUser(
    userId: number,
    includeGames = false,
    includeChannels = false
  ): Promise<User> {
    return this.prisma.user
      .findFirst({
        where: {
          id: userId,
        },
        include: {
          wins: includeGames,
          loses: includeGames,
          channels: includeChannels,
        },
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
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
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user
      .delete({
        where,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getChannels(userId: number): Promise<string[]> {
    let channelList = [];
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { channels: true },
    });
    if (user)
      user.channels.forEach((channel) => {
        channelList.push(channel.name);
      });
    return channelList;
  }

  async isBanned(userId: number, targetUserName: string): Promise<boolean> {
    return this.prisma.user
      .findUnique({
        where: {
          name: targetUserName,
        },
      })
      .then((user) => {
        return user.bannedIds.includes(userId);
      })
      .catch(() => false);
  }

  async addFriend(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (targetUser && !targetUser.bannedIds.includes(userId)) {
          if (!user.friendIds.includes(targetUser.id)) {
            this.prisma.user
              .update({
                where: {
                  id: userId,
                },
                data: {
                  friendIds: {
                    push: targetUser.id,
                  },
                },
              })
              .then()
              .catch((e) => {
                throw new BadRequestException(e.message);
              });
          }
        }
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async removeFriend(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (targetUser) {
          if (user.friendIds.includes(targetUser.id))
            this.prisma.user
              .update({
                where: {
                  id: userId,
                },
                data: {
                  friendIds: {
                    set: user.friendIds.filter((id) => id != targetUser.id),
                  },
                },
              })
              .then()
              .catch((e) => {
                throw new BadRequestException(e.message);
              });
        }
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async getFriends(userId: number): Promise<User[]> {
    let friendsList: User[] = [];
    try {
      const user = await this.getUser(userId);
      if (user) {
        for (const friendId of user.friendIds) {
          const friend = await this.getUser(friendId);
          friendsList.push(friend);
        }
      }
      return friendsList;
    } catch (e) {
      console.log("err", e.meta.cause);
    }
  }

  async banPersonally(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (targetUser) {
          if (!user.bannedIds.includes(targetUser.id))
            this.prisma.user
              .update({
                where: {
                  id: userId,
                },
                data: {
                  bannedIds: {
                    push: targetUser.id,
                  },
                },
              })
              .then()
              .catch((e) => {
                throw new BadRequestException(e.message);
              });
        }
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async unbanPersonally(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (targetUser) {
          if (user.bannedIds.includes(userId))
            this.prisma.user
              .update({
                where: {
                  id: userId,
                },
                data: {
                  bannedIds: {
                    set: user.bannedIds.filter((id) => id != targetUser.id),
                  },
                },
              })
              .then()
              .catch((e) => {
                throw new BadRequestException(e.message);
              });
        }
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async getPersonallyBanned(userId: number): Promise<User[]> {
    let bannedList: User[] = [];
    try {
      const user = await this.getUser(userId);
      if (user) {
        for (const bannedId of user.bannedIds) {
          const friend = await this.getUser(bannedId);
          bannedList.push(friend);
        }
      }
      return bannedList;
    } catch (e) {
      console.log("err", e.meta.cause);
    }
  }
}
