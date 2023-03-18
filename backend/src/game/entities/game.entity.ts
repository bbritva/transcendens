import { Game } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entities/user.entity';

export class GameEntity implements Game {
  @ApiProperty()
  winnerScore: number;

  @ApiProperty()
  loserScore: number;
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  winnerId: number;
  winner?: UserEntity;

  
  @ApiProperty()
  loserId: number;
  loser?: UserEntity;
}