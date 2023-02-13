import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Channel, Message, Prisma } from "@prisma/client";
import * as DTO from "src/chat/websocket/websocket.dto";
import { MessageService } from "src/chat/message/message.service";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import { ChannelEntity } from "./entities/channel.entity";
import { channel } from "diagnostics_channel";

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService
  ) {}

  async Channel(
    ChannelWhereUniqueInput: Prisma.ChannelWhereUniqueInput
  ): Promise<Channel | null> {
    return this.prisma.channel
      .findUnique({
        where: ChannelWhereUniqueInput,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
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
    return this.prisma.channel
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

  async ChannelList(): Promise<DTO.ChannelInfoOut[]> {
    let channelList: DTO.ChannelInfoOut[] = [];
    return this.prisma.channel
      .findMany({
        where: {
          type: {
            equals: "GENERAL",
          },
        },
      })
      .then((res: ChannelEntity[]) => {
        res.forEach((channel) => {
          channelList.push({
            name: channel.name,
            isPrivate: channel.isPrivate,
            hasPassword: channel.password != null,
          });
        });
        return channelList;
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async connectToChannel(
    data: Prisma.ChannelCreateInput
  ): Promise<ChannelEntity> {
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
          type: data.type,
          admIds: [data.ownerId],
        },
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async leaveChannel(userId : number, channelName : string) : Promise<Channel> {
    return this.updateChannel({
      where: {
        name: channelName,
      },
      data: {
        guests: {
          disconnect: {
            id: userId,
          },
        },
      },
    }).then((channel) => channel)
    .catch((e) => {
      throw new BadRequestException(e.message);
    })
  }

  async getChannel(
    channelName: string,
    includeMessages = false,
    includeGuests = false
  ): Promise<Channel> {
    return this.prisma.channel
      .findUnique({
        where: {
          name: channelName,
        },
        include: {
          messages: includeMessages,
          guests: includeGuests,
        },
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async setPrivacy(
    executorId: number,
    data: DTO.SetPrivacyI
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
        where: {
          name: data.channelName,
          admIds: {
            has: executorId,
          },
        },
        data: {
          isPrivate: data.isPrivate,
        },
      })
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
  }

  async setPassword(
    executorId: number,
    data: DTO.SetPasswordI
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
        where: {
          name: data.channelName,
          ownerId: executorId,
        },
        data: {
          password: data.password,
        },
      })
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
  }

  async addAdmin(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
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
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
  }

  async unmuteUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
        where: {
          name: channelName,
          admIds: {
            has: executorId,
          },
        },
        data: {
          mutedIds: {
            set: (await this.getChannel(channelName)).mutedIds.filter(
              (id) => id != targetId
            ),
          },
        },
      })
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
  }

  async unbanUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
        where: {
          name: channelName,
          admIds: {
            has: executorId,
          },
        },
        data: {
          bannedIds: {
            set: (await this.getChannel(channelName)).mutedIds.filter(
              (id) => id != targetId
            ),
          },
        },
      })
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
  }

  async changeChannelName(
    executorId: number,
    data: DTO.ChangeChannelNameI
  ): Promise<boolean> {
    return this.prisma.channel
      .updateMany({
        where: {
          name: data.channelName,
          admIds: {
            has: executorId,
          },
        },
        data: {
          name: data.newName,
        },
      })
      .then((ret: any) => {
        return ret.count != 0;
      })
      .catch((e: any) => {
        return false;
      });
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
    return this.prisma.channel
      .findUnique({
        where: {
          name: channelName,
        },
      })
      .then((channel) => {
        return channel.mutedIds.includes(userId);
      })
      .catch((e: any) => {
        console.log("err", e.meta.cause);
        throw new BadRequestException(e.message);
      });
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
      if (!channel.bannedIds.includes(targetId))
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
    return this.getChannel(channelName)
      .then((channel: Channel) => {
        if (channel.admIds.includes(executorId)) {
          if (!channel.mutedIds.includes(targetId))
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
      })
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }

  async deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel> {
    return this.prisma.channel
      .delete({
        where,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw new BadRequestException(e.message);
      });
  }
}
