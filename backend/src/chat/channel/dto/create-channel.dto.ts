import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  ownerId: number;
}
