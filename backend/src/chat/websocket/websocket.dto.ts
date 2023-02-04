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

export interface ChannelInfoOut {
  name: string;
  messages?: MessageEntity[];
  users?: UserEntity[];
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

export interface scoreDataI{
  game: string,
  playerOne: {
    name: string, 
    score: number
  },
  playerTwo: {
    name: string, 
    score: number
  },
}

export interface coordinateDataI{
  game: string,
  playerY: number,
  ball: {x: number, y: number}
}

export interface gameChannelDataI{
  name: string,
  first: string,
  second: string
  guests: string[]
}
