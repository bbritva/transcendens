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
