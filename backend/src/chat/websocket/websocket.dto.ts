import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";

export interface ChannelInfoDto {
  name: string;
}

export interface ChannelInfoDtoOut extends ChannelInfoDto {
  messages?: MessageEntity[];
  users?: UserEntity[];
}

export interface ChannelInfoDtoIn extends ChannelInfoDto {
  users: {name: string}[];
}

export interface UserConnectedDto {
  channelName: string;
  userName: string;
}

export class ClientDTO {
  readonly id: string
  readonly username: string;
}

export class ConnectedClientInfo {
  readonly username: string;
}

export class DecodedTokenDTO {
  readonly id: number
  readonly username: string;
}