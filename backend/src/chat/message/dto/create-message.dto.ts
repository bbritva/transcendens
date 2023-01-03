import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty()
  readonly header: {
    readonly userName: string;
    readonly sentAt: Date;
    readonly channel: string;
  };
  @ApiProperty()
  readonly text: string;
}
