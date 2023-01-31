import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Channel, Message, Prisma } from "@prisma/client";
import { ChannelInfoDto } from "./dto/channelInfo.dto";
import { ManageChannel } from "src/chat/websocket/websocket.dto";
import { MessageService } from "src/chat/message/message.service";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService
  ) {}

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

  async getChannel(channelName: string, includeMessages = false, includeGuests = false): Promise<Channel> {
    return this.prisma.channel.findUnique({
      where: {
        name: channelName,
      },
      include: {
        messages: includeMessages,
        guests: includeGuests
      },
    });
  }

  async setPrivacy(executorId: number, data: ManageChannel): Promise<boolean> {
    return (
      (
        await this.prisma.channel.updateMany({
          where: {
            name: data.name,
            admIds: {
              has: executorId,
            },
          },
          data: {
            isPrivate: data.params[0],
          },
        })
      ).count != 0
    );
  }

  async setPassword(executorId: number, data: ManageChannel): Promise<boolean> {
    return (
      (
        await this.prisma.channel.updateMany({
          where: {
            name: data.name,
            ownerId: executorId,
          },
          data: {
            password: data.params[0],
          },
        })
      ).count != 0
    );
  }

  async addAdmin(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return (
      (
        await this.prisma.channel.updateMany({
          where: {
            name: channelName,
            ownerId: executorId,
          },
          data: {
            admIds: {
              push: targetId,
            },
          },
        })
      ).count != 0
    );
  }

  async unmuteUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return (
      (
        await this.prisma.channel.updateMany({
          where: {
            name: channelName,
            admIds: {
              has: executorId,
            },
          },
          data: {
            mutedIds: {
              set: (
                await this.getChannel(channelName)
              ).mutedIds.filter((id) => id != targetId),
            },
          },
        })
      ).count != 0
    );
  }

  async unbanUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return (
      (
        await this.prisma.channel.updateMany({
          where: {
            name: channelName,
            admIds: {
              has: executorId,
            },
          },
          data: {
            bannedIds: {
              set: (
                await this.getChannel(channelName)
              ).mutedIds.filter((id) => id != targetId),
            },
          },
        })
      ).count != 0
    );
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

  async isMuted(channelName: string, userId: number): Promise<boolean> {
    return (
      await this.prisma.channel.findUnique({
        where: {
          name: channelName,
        },
      })
    ).mutedIds.includes(userId);
  }

  async addMessage(
    executorId: number,
    data: CreateMessageDTO
  ): Promise<Message> {
    if (!(await this.isMuted(data.channelName, executorId))) {
      try {
        const messageOut = await this.messageService.createMessage({
          channel: {
            connect: { name: data.channelName },
          },
          authorName: data.authorName,
          text: data.text,
        });
        return messageOut;
      } catch (e) {
        console.log("err", e.meta.cause);
      }
    }
    return null;
  }

  async banUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    const channel = await this.getChannel(channelName);
    if (channel.admIds.includes(executorId)) {
      this.updateChannel({
        where: {
          name: channelName,
        },
        data: {
          bannedIds: {
            push: targetId,
          },
        },
      });
      return true;
    } else return false;
  }

  async muteUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    const channel = await this.getChannel(channelName);
    if (channel.admIds.includes(executorId)) {
      this.updateChannel({
        where: {
          name: channelName,
        },
        data: {
          mutedIds: {
            push: targetId,
          },
        },
      });
      return true;
    } else return false;
  }

  async deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel> {
    return this.prisma.channel.delete({
      where,
    });
  }
}
