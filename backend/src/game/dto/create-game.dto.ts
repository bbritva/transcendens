import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty()
  winnerId: number;

  @ApiProperty()
  loserId: number;

  @ApiProperty()
  result: number[];
}
