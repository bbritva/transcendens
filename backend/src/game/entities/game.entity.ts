import { Game } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GameEntity implements Game {
  @ApiProperty()
  winnerScore: number;

  @ApiProperty()
  loserScore: number;
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  winnerId: number;
  
  @ApiProperty()
  loserId: number;
  
}