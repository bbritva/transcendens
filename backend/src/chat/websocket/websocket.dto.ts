import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";

export interface ManageChannel {
  name: string;
  params: any[]
}

export interface ChannelInfoIn {
  name: string;
  isPrivate?: boolean;
  password?: string;
  users?: {name: string}[];
}

export interface ChannelInfoOut {
  name: string;
  messages: MessageEntity[];
  users: UserEntity[];
}

export class Client {
  readonly id: number
  readonly name: string;
}

export class ConnectedClientInfo {
  readonly id: number
  readonly name: string;
}

export class DecodedToken {
  readonly id: number
  readonly name: string;
}