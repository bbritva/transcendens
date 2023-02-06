import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token, Prisma } from '@prisma/client';

@Injectable()
export class TokenService {
    constructor(private prisma: PrismaService) {}

    async token(
        postWhereUniqueInput: Prisma.TokenWhereUniqueInput,
      ): Promise<Token | null> {
        return this.prisma.token.findUnique({
          where: postWhereUniqueInput,
        });
      }
    
      async tokens(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.TokenWhereUniqueInput;
        where?: Prisma.TokenWhereInput;
        orderBy?: Prisma.TokenOrderByWithRelationInput;
      }): Promise<Token[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.token.findMany({
          skip,
          take,
          cursor,
          where,
          orderBy,
        });
      }
    
      async createToken(data: Prisma.TokenCreateInput): Promise<Token> {
        return this.prisma.token.create({
          data,
        })
        .then((ret) => ret)
        .catch(() => null);
      }

      async getToken(tokenId: number): Promise<Token> {
        return this.prisma.token.findUnique({
            where: {
                id: tokenId,
            },
        });
      }
    
      async updateToken(params: {
        where: Prisma.TokenWhereUniqueInput;
        data: Prisma.TokenUpdateInput;
      }): Promise<Token> {
        const { data, where } = params;
        return this.prisma.token.update({
          data,
          where,
        });
      }
    
      async deleteToken(where: Prisma.TokenWhereUniqueInput): Promise<Token> {
        return this.prisma.token.delete({
          where,
        });
      }
    }
