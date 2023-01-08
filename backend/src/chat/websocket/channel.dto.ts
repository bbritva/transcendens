import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "../message/entities/message.entity";

export class ChannelInfoDto {
  name: string;
  users?: UserEntity[];
  messages?: MessageEntity[]
}
