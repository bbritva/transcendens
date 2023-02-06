import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";

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

export interface NotAllowedI {
  eventName: string;
  data: any;
}

export interface UserManageI {
  channelName: string;
  targetUserName: string;
}

export interface ChangeChannelNameI {
  channelName: string;
  newName: string;
}

export interface SetPrivacyI {
  channelName: string;
  isPrivate: boolean;
}

export interface SetPasswordI {
  channelName: string;
  password: string;
}

export interface InviteToGameI {
  recipient: string;
}

export interface AcceptInviteI {
  sender: string;
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
