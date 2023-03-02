import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty()
  winnerId: number;

  @ApiProperty()
  loserId: number;

  @ApiProperty()
  winnerScore: number;

  @ApiProperty()
  loserScore: number;
}

export class GameResultDto {
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  winnerName: string;

  @ApiProperty()
  loserName: string;

  @ApiProperty()
  winnerScore: number;

  @ApiProperty()
  loserScore: number;
}
