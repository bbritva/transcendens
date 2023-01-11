import { MessageEntity } from "src/chat/message/entities/message.entity";
import { UserEntity } from "src/user/entities/user.entity";

export class ChannelInfoDto {
  name: string;
  guests: UserEntity[];
  messages: MessageEntity[]
}
