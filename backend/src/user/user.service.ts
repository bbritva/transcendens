import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User, Prisma, eStatus } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  NameSuggestionInfo,
  UserInfoPublic,
} from "src/chat/websocket/websocket.dto";
import { CreateGameDto, GameResultDto } from "src/game/dto/create-game.dto";
import { UserEntity } from "./entities/user.entity";
import { Server } from "socket.io";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  server: Server;
  setServer(server: Server) {
    this.server = server;
  }

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
    return this.getUserPublic(id, true)
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
  ): Promise<UserEntity> {
    return this.prisma.user
      .findUnique({
        where: {
          name: userName,
        },
        include: {
          wins: includeGames && {
            include: {
              winner: true,
              loser: true,
            },
          },
          loses: includeGames && {
            include: {
              winner: true,
              loser: true,
            },
          },
          channels: includeChannels,
        },
      })
      .then((ret: UserEntity) => {
        if (includeGames) {
          for (const game of ret.wins) {
            this.filterUserdata(game.winner);
            this.filterUserdata(game.loser);
          }
          for (const game of ret.loses) {
            this.filterUserdata(game.winner);
            this.filterUserdata(game.loser);
          }
        }
        return ret;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getUserPublic(
    userId: number,
    includeGames = false,
    includeChannels = false
  ): Promise<UserEntity> {
    return this.getUser(userId, includeGames, includeChannels)
      .then((user) => {
        this.filterUserdata(user);
        if (includeGames) {
          for (const game of user.wins) {
            this.filterUserdata(game.winner);
            this.filterUserdata(game.loser);
          }
          for (const game of user.loses) {
            this.filterUserdata(game.winner);
            this.filterUserdata(game.loser);
          }
        }
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
  ): Promise<UserEntity> {
    return this.prisma.user
      .findUnique({
        where: {
          id: userId,
        },
        include: {
          wins: includeGames && {
            include: {
              winner: true,
              loser: true,
            },
          },
          loses: includeGames && {
            include: {
              winner: true,
              loser: true,
            },
          },
          channels: includeChannels,
        },
      })
      .then((ret: UserEntity) => ret)
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
      .then((ret: any) => {
        if (this.server)
          this.server.emit("newUserName", {
            id: ret.id,
            name: ret.name,
          });
        return ret;
      })
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
    if (!user) throw new NotFoundException();
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (!targetUser) throw new NotFoundException();
        if (targetUser.bannedIds.includes(userId))
          throw new ForbiddenException();
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
              throw e;
            });
        }
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw e;
      });
  }

  async removeFriend(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new NotFoundException();
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (!targetUser) throw new NotFoundException();
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
              throw e;
            });
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw e;
      });
  }

  async getFriends(userId: number): Promise<UserInfoPublic[]> {
    let friendsList: UserInfoPublic[] = [];
    const user = await this.getUser(userId);
    if (!user) throw new NotFoundException();
    for (const friendId of user.friendIds) {
      const friend = await this.getUser(friendId);
      if (friend) {
        this.filterUserdata(friend);
        friendsList.push(friend);
      }
    }
    return friendsList;
  }

  async getNamesSuggestion(name: string): Promise<NameSuggestionInfo[]> {
    let names: NameSuggestionInfo[] = [];
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
            this.filterUserdata(user);
            delete user.avatar;
            delete user.image;
            delete user.status;
            delete user.score;
            names.push(user);
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
    if (!user) throw new NotFoundException();
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (!targetUser) throw new NotFoundException();
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
            .catch((e) => {
              throw e;
            });
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw e;
      });
  }

  async unbanPersonally(userId: number, targetUserName: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new NotFoundException();
    return this.getUserByName(targetUserName)
      .then((targetUser) => {
        if (!targetUser) throw new NotFoundException();
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
              throw e;
            });
        this.filterUserdata(targetUser);
        return targetUser;
      })
      .catch((e) => {
        throw e;
      });
  }

  async getPersonallyBanned(userId: number): Promise<UserInfoPublic[]> {
    let bannedList: UserInfoPublic[] = [];
    const user = await this.getUser(userId);
    if (!user) throw new NotFoundException();
    for (const bannedId of user.bannedIds) {
      const banned = await this.getUser(bannedId);
      if (banned) {
        this.filterUserdata(banned);
        bannedList.push(banned);
      }
    }
    return bannedList;
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
