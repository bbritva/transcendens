import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";

export interface ManageChannel {
  name: string;
  params: any[];
}

export interface ChannelInfoIn {
  name: string;
  isPrivate?: boolean;
  password?: string;
  users?: { name: string }[];
}

export interface ChannelInfoOut extends ChannelInfoShort{
  messages: MessageEntity[];
  users: UserEntity[];
}

export interface ChannelInfoShort {
  name: string;
  isPrivate: boolean;
  hasPassword: boolean;
}

export class ClientInfo {
  readonly id: number;
  readonly name: string;
  readonly socketId?: string;
}

export interface ToEmit {
  name: string;
  param: any;
}
