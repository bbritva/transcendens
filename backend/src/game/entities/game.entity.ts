import { Game } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GameEntity implements Game {
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  winnerId: number;
  
  @ApiProperty()
  loserId: number;
  
  @ApiProperty()
  result: number[];
}