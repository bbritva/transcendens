import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "../message/entities/message.entity";

export interface ChannelInfoDto {
  name: string;
}

export interface ChannelInfoDtoOut extends ChannelInfoDto {
  messages?: MessageEntity[];
  users?: UserEntity[];
}

export interface ChannelInfoDtoIn extends ChannelInfoDto {
  users: string[];
}
