import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User, Prisma, eStatus } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserInfoPublic } from "src/chat/websocket/websocket.dto";
import { CreateGameDto, GameResultDto } from "src/game/dto/create-game.dto";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async users(params: {
    select?: Prisma.UserSelect;
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

  async getLadder(): Promise<User[]> {
    return this.users({
      orderBy: {
        score: "desc",
      },
    })
      .then((users) => {
        users.forEach((user) => {
          this.filterUserdata(user);
        });
        return users;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getStats(id: number): Promise<User> {
    return this.getUser(id, true)
      .then((user) => {
        this.filterUserdata(user);
        return user;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getStatsByName(name: string): Promise<User> {
    return this.getUserByName(name, true)
      .then((user) => {
        this.filterUserdata(user);
        return user;
      })
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

  async getUserByName(
    userName: string,
    includeGames = false,
    includeChannels = false
  ): Promise<User> {
    return this.prisma.user
      .findUnique({
        where: {
          name: userName,
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

  async getUserPublic(
    userId: number,
    includeGames = false,
    includeChannels = false
  ): Promise<User> {
    return this.getUser(userId, includeGames, includeChannels)
      .then((user) => {
        this.filterUserdata(user);
        return user;
      })
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
      .findUnique({
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

  async setUserStatus(userId: number, status: eStatus): Promise<UserEntity> {
    return this.updateUser(
      {
        where: {
          id: userId,
        },
        data: {
          status: status,
        },
      },
      status == "OFFLINE"
    )
      .then((ret) => ret)
      .catch((e) => {
        console.log(e.message);
        return null;
      });
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    includeChannels = false
  ): Promise<User> {
    const { where, data } = params;
    return this.prisma.user
      .update({
        data,
        where,
        include: {
          channels: includeChannels,
        },
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
        this.filterUserdata(targetUser);
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
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async getFriends(userId: number): Promise<UserInfoPublic[]> {
    let friendsList: UserInfoPublic[] = [];
    try {
      const user = await this.getUser(userId);
      if (user) {
        for (const friendId of user.friendIds) {
          const friend = await this.getUser(friendId);
          friendsList.push({
            id: friend.id,
            name: friend.name,
            status: friend.status,
            image: friend.image,
            avatar: friend.avatar,
          });
        }
      }
      return friendsList;
    } catch (e) {
      console.log("err", e.meta.cause);
    }
  }

  async getNamesSuggestion(name: string): Promise<string[]> {
    let names: string[] = [];
    try {
      if (!!name) {
        const users = await this.prisma.user.findMany({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });
        if (users) {
          for (const user of users) {
            names.push(user.name);
          }
        }
      }
      return names;
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
        this.filterUserdata(targetUser);
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
          if (user.bannedIds.includes(targetUser.id))
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
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async getPersonallyBanned(userId: number): Promise<UserInfoPublic[]> {
    let bannedList: UserInfoPublic[] = [];
    try {
      const user = await this.getUser(userId);
      if (user) {
        for (const bannedId of user.bannedIds) {
          const banned = await this.getUser(bannedId);
          bannedList.push({
            id: banned.id,
            name: banned.name,
            status: banned.status,
            image: banned.image,
            avatar: banned.avatar,
          });
        }
      }
      return bannedList;
    } catch (e) {
      console.log("err", e.meta.cause);
    }
  }

  async addScores(gameResult: GameResultDto): Promise<CreateGameDto> {
    const diff = gameResult.winnerScore - gameResult.loserScore;
    let game = {
      winnerId: 0,
      loserId: 0,
      winnerScore: gameResult.winnerScore,
      loserScore: gameResult.loserScore,
    };
    await this.prisma.user
      .update({
        where: {
          name: gameResult.winnerName,
        },
        data: {
          score: { increment: diff },
        },
      })
      .then((user) => {
        game.winnerId = user.id;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
    await this.prisma.user
      .update({
        where: {
          name: gameResult.loserName,
        },
        data: {
          score: { decrement: diff },
        },
      })
      .then((user) => {
        game.loserId = user.id;
      })
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
    return game;
  }

  filterUserdata(user: User) {
    delete user.friendIds;
    delete user.bannedIds;
    delete user.tokenId;
    delete user.refreshToken;
    delete user.twoFaSecret;
    delete user.isTwoFaEnabled;
    delete user.twoFaSecret;
  }
}
