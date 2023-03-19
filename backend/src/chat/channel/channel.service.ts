import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Channel, Message, Prisma } from "@prisma/client";
import * as DTO from "src/chat/websocket/websocket.dto";
import { MessageService } from "src/chat/message/message.service";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import { ChannelEntity } from "./entities/channel.entity";
import * as bcrypt from "bcrypt";
import { env } from "process";

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
            hasPassword: !!channel.password,
          });
        });
        return channelList;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  async connectToChannel(
    data: Prisma.ChannelCreateInput
  ): Promise<ChannelEntity> {
    return bcrypt
      .hash(data.password ? data.password : "", parseInt(env.HASH_SALT))
      .then(async (hashedPassword) => {
        try {
          data.password = hashedPassword;
          const ret = await this.prisma.channel.upsert({
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
          });
          return ret;
        } catch (e) {
          throw e;
        }
      })
      .catch((e: any) => {
        throw e;
      });
  }

  async leaveChannel(userId: number, channelName: string): Promise<Channel> {
    this.getChannel(channelName);
    return this.getChannel(channelName, false, true).then(async (channel) => {
      if (!channel) throw new NotFoundException();
      const newOwnerId =
        channel.ownerId != userId
          ? channel.ownerId
          : channel.admIds[0]
          ? channel.admIds[0]
          : channel.guests[0]
          ? channel.guests[0].id
          : channel.ownerId;
      return this.updateChannel({
        where: {
          name: channelName,
        },
        data: {
          ownerId : newOwnerId,
          guests: {
            disconnect: {
              id: userId,
            },
          },
        },
      })
        .then((channel) => channel)
        .catch((e) => {
          throw e;
        });
    });
  }

  async getChannel(
    channelName: string,
    includeMessages = false,
    includeGuests = false
  ): Promise<ChannelEntity> {
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
        throw e;
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
      .then((ret: any) => ret.count != 0)
      .catch((e: any) => {
        throw e;
      });
  }

  async setPassword(
    executorId: number,
    data: DTO.SetPasswordI
  ): Promise<boolean> {
    return bcrypt
      .hash(data.password ? data.password : "", parseInt(env.HASH_SALT))
      .then(async (hashedPassword) => {
        data.password = hashedPassword;
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
          .then((ret: any) => ret.count != 0)
          .catch((e) => {
            throw e;
          });
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
      .then((ret: any) => ret.count != 0)
      .catch((e) => {
        throw e;
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
      .then((ret: any) => ret.count != 0)
      .catch((e: any) => {
        throw e;
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
      .then((ret: any) => ret.count != 0)
      .catch((e: any) => {
        throw e;
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
      .then((ret: any) => ret.count != 0)
      .catch((e) => {
        throw e;
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
        if (channel) return channel.mutedIds.includes(userId);
        else throw new NotFoundException();
      })
      .catch((e: any) => {
        throw e;
      });
  }

  async addMessage(
    executorId: number,
    data: CreateMessageDTO
  ): Promise<Message> {
    return this.isMuted(data.channelName, executorId)
      .then(async (isMuted) => {
        if (isMuted) throw new ForbiddenException();
        else
          return this.messageService
            .createMessage({
              channel: {
                connect: { name: data.channelName },
              },
              authorName: data.authorName,
              authorId: parseInt( data.authorId),
              text: data.text,
            })
            .then((message) => message)
            .catch((e) => {
              throw e;
            });
      })
      .catch((e) => {
        throw e;
      });
  }

  async banUser(
    executorId: number,
    channelName: string,
    targetId: number
  ): Promise<boolean> {
    const channel = await this.getChannel(channelName);
    if (!channel) throw new NotFoundException();
    if (channel.admIds.includes(executorId)) {
      if (!channel.bannedIds.includes(targetId))
        return this.updateChannel({
          where: {
            name: channelName,
          },
          data: {
            bannedIds: {
              push: targetId,
            },
          },
        })
          .then(() => true)
          .catch((e) => {
            throw e;
          });
      else return true;
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
            })
              .then(() => true)
              .catch((e) => {
                throw e;
              });
          else return true;
        } else return false;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  async deleteChannel(where: Prisma.ChannelWhereUniqueInput): Promise<Channel> {
    return this.prisma.channel
      .delete({
        where,
      })
      .then((ret: any) => ret)
      .catch((e: any) => {
        throw e;
      });
  }
}
