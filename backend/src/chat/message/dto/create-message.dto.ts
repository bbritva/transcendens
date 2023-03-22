import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty({ uniqueItems: true })
  id?: number;

  @ApiProperty()
  channelName: string;
  
  @ApiProperty()
  sentAt: Date;
  
  @ApiProperty()
  authorName: string;
  
  @ApiProperty()
  text: string;
}

export class PrivateMessageDTO {
  @ApiProperty()
  readonly to: string;
  @ApiProperty()
  readonly content: string;
}
