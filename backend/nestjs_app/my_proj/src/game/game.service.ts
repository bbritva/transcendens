import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
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
    return this.prisma.game.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async addGame(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }

  async getGame(gameId: number): Promise<Game> {
    return this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
    });
  }

  async deleteGame(where: Prisma.UserWhereUniqueInput): Promise<Game> {
    return this.prisma.game.delete({
      where,
    });
  }
}