import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  readonly header: {
    readonly JWTtoken: string;
    readonly userName: string;
    readonly sentAt: Date;
    readonly channel: string;
  };
  @ApiProperty()
  readonly text: string;
}
