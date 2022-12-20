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

  @ApiProperty()
  friendIds: number[];

  @ApiProperty()
  tokenId: number;

  @ApiProperty()
  refreshToken: string;
}