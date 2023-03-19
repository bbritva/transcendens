import { Message } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class MessageEntity implements Message {
  @ApiProperty({ uniqueItems: true })
  id: number;

  @ApiProperty()
  channelName: string;
  
  @ApiProperty()
  sentAt: Date;
  
  @ApiProperty()
  authorName: string;
  
  @ApiProperty()
  authorId: number;
  
  @ApiProperty()
  text: string;

  toString(): string {
    return (
      this.sentAt.toDateString + " " + this.authorName + ": " + this.text + "\n"
    );
  }
}
