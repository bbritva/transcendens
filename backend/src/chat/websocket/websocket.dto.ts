import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";
import { eStatus } from "@prisma/client";

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

export interface UserInfoPublic {
  id: number
  name: string;
  image?: string;
  avatar?: string;
  status: eStatus;
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

export interface ManageChannelI {
  channelName: string;
}

export interface ManageUserInChannelI  extends ManageChannelI {
  targetUserName: string;
}

export interface ChangeChannelNameI extends ManageChannelI {
  newName: string;
}

export interface SetPrivacyI extends ManageChannelI {
  isPrivate: boolean;
}

export interface SetPasswordI extends ManageChannelI {
  password: string;
}

export interface ManageUserI {
  targetUserName: string;
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
