import { ApiProperty } from '@nestjs/swagger';
import { eStatus } from '@prisma/client';
import { GameEntity } from 'src/game/entities/game.entity';

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

export class UserStatI {
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
  wins: GameEntity;

  @ApiProperty({ required: false })
  loses: GameEntity;

  @ApiProperty()
  score: number;

}