import { ApiProperty } from '@nestjs/swagger';
import { eStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  name: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ required: false })
  status?: eStatus;

  @ApiProperty({ required: false })
  tokenId?: number;

  @ApiProperty({ required: false })
  refreshToken?: string;

}
