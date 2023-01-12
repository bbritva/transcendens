import { Channel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ChannelEntity implements Channel {
  @ApiProperty({uniqueItems : true})
  name: string;

  @ApiProperty()
  ownerId: number;

  @ApiProperty()
  admIds: number[];
  @ApiProperty()
  mutedIds: number[];
  @ApiProperty()
  bannedIds: number[];

  @ApiProperty()
  isPrivate: boolean;

}