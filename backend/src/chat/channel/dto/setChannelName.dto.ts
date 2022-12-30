import { ApiProperty } from '@nestjs/swagger';

export class SetChannelNameDto {
  @ApiProperty()
  oldName: string;

  @ApiProperty()
  newName: string;
}
