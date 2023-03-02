import { eStatus, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { GameEntity } from 'src/game/entities/game.entity';
import { ChannelEntity } from 'src/chat/channel/entities/channel.entity';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty({uniqueItems : true})
  name: string;

  @ApiProperty()
  status: eStatus;

  @ApiProperty()
  image: string;

  @ApiProperty()
  wins?: GameEntity[];
  @ApiProperty()
  loses?: GameEntity[];

  @ApiProperty()
  channels?: ChannelEntity[];

  @ApiProperty({ nullable: true})
  avatar: string;

  @ApiProperty({ nullable: true})
  score: number;

  @ApiProperty({isArray: true, type : "number"})
  friendIds: number[];

  @ApiProperty({isArray: true, type : "number"})
  bannedIds: number[];

  @ApiProperty()
  tokenId: number;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  twoFaSecret: string | null;

  @ApiProperty()
  isTwoFaEnabled: boolean;
}