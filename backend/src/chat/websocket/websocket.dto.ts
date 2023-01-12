import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";

export interface ManageChannelDto {
  name: string;
  params: any[]
}

export interface ChannelInfoDtoIn {
  name: string;
  isPrivate?: boolean;
  users?: {name: string}[];
}

export interface ChannelInfoDtoOut {
  name: string;
  messages: MessageEntity[];
  users: UserEntity[];
}

export interface UserConnectedDto {
  channelName: string;
  userName: string;
}

export class ClientDTO {
  readonly id: number
  readonly name: string;
}

export class ConnectedClientInfo {
  readonly name: string;
}

export class DecodedTokenDTO {
  readonly id: number
  readonly name: string;
}