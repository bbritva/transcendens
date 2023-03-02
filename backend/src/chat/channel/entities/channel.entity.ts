import { Channel, eChannelType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entities/user.entity';
import { MessageEntity } from 'src/chat/message/entities/message.entity';

export class ChannelEntity implements Channel {
  @ApiProperty({uniqueItems : true})
  name: string;

  @ApiProperty()
  ownerId: number;

  @ApiProperty()
  password: string;
  @ApiProperty()
  guests?: UserEntity[];
  @ApiProperty()
  messages?: MessageEntity[];

  @ApiProperty()
  admIds: number[];
  @ApiProperty()
  mutedIds: number[];
  @ApiProperty()
  bannedIds: number[];

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  type: eChannelType;

}