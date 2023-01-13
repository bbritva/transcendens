import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Channel, Prisma } from "@prisma/client";
import { ChannelInfoDto } from "./dto/channelInfo.dto";
import { ManageChannelDto } from "../websocket/websocket.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService,
    private jwtService: JwtService) {}

  async Channel(
    ChannelWhereUniqueInput: Prisma.ChannelWhereUniqueInput
  ): Promise<Channel | null> {
    return this.prisma.channel.findUnique({
      where: ChannelWhereUniqueInput,
    });
  }

  async Channels(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChannelWhereUniqueInput;
    where?: Prisma.ChannelWhereInput;
    orderBy?: Prisma.ChannelOrderByWithRelationInput;
  }): Promise<Channel[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.channel.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async ChannelList(): Promise<{ name: string }[]> {
    return this.prisma.channel.findMany({ select: { name: true } });
  }

  async connectToChannel(
    data: Prisma.ChannelCreateInput
  ): Promise<ChannelInfoDto> {
    return this.prisma.channel
      .upsert({
        include: {
          guests: true,
          messages: true,
        },
        where: { name: data.name },
        // if channel exists
        update: {
          guests: {
            connect: {
              id: data.ownerId,
            },
          },
        },
        // if channel doesn't exist
        create: {
          name: data.name,
          ownerId: data.ownerId,
          password: data.password,
          guests: {
            connect: {
              id: data.ownerId,
            },
          },
          isPrivate: data.isPrivate,
          admIds: [data.ownerId],
        },
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async getChannel(channelName: string): Promise<Channel> {
    return this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        messages: true,
      },
    });
  }

  async setPrivacy(
    executorId: number,
    data: ManageChannelDto
  ): Promise<number> {
    return (
      await this.prisma.channel.updateMany({
        where: {
          name: data.name,
          admIds: {
            has: executorId,
          },
        },
        data: {
          isPrivate: data.params[0]
        },
      })
    ).count;
  }

  async addAdmin(executorId: number, data: ManageChannelDto): Promise<number> {
    return (
      await this.prisma.channel.updateMany({
        where: {
          name: data.name,
          admIds: {
            has: executorId,
          },
        },
        data: {
          admIds: {
            push: data.params[0],
          },
        },
      })
    ).count;
  }

  async updateChannel(params: {
    where: Prisma.ChannelWhereUniqueInput;
    data: Prisma.ChannelUpdateInput;
  }): Promise<Channel> {
    const { where, data } = params;
    return this.prisma.channel
      .update({
        data,
        where,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            console.log(
              "There is a unique constraint violation, a Channel cannot be updated"
            );
          }
        }
        throw e;
      });
  }

  async deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel> {
    return this.prisma.channel.delete({
      where,
    });
  }
}
