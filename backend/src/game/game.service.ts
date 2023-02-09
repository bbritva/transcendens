import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Game, Prisma } from "@prisma/client";
import { UserService } from "src/user/user.service";
import { CreateGameDto } from "./dto/create-game.dto";

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput
  ): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: gameWhereUniqueInput,
    });
  }

  async games(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Game[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.game
      .findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      })
      .then((ret) => ret)
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async addGame(gameData: CreateGameDto): Promise<Game> {
    this.userService.addScores(gameData).then()
    .catch((e) => {
      throw new BadRequestException(e.message);
    });
    return this.prisma.game
      .create({
        data: {
          winner: {
            connect: { id: gameData.winnerId },
          },
          loser: {
            connect: { id: gameData.loserId },
          },
          result: gameData.result,
        },
      })
      .then((ret) => ret)
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async getGame(gameId: number): Promise<Game> {
    return this.prisma.game
      .findUnique({
        where: {
          id: gameId,
        },
      })
      .then((ret) => ret)
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async deleteGame(where: Prisma.UserWhereUniqueInput): Promise<Game> {
    return this.prisma.game
      .delete({
        where,
      })
      .then((ret) => ret)
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }
}
