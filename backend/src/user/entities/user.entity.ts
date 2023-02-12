import { eStatus, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty({uniqueItems : true})
  name: string;

  @ApiProperty()
  status: eStatus;

  @ApiProperty()
  image: string;

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