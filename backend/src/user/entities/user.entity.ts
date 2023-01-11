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

  @ApiProperty({isArray: true, type : "number"})
  friendIds: number[];

  @ApiProperty()
  tokenId: number;

  @ApiProperty()
  refreshToken: string;
}