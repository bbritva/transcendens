import { UserEntity } from "src/user/entities/user.entity";
import { MessageEntity } from "src/chat/message/entities/message.entity";
import { eChannelType, eStatus } from "@prisma/client";
import { GameEntity } from "src/game/entities/game.entity";

export interface ChannelInfoIn {
  name: string;
  ownerId?: number;
  isPrivate?: boolean;
  password?: string;
  users?: { name: string }[];
  type?: eChannelType;
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
  wins?: GameEntity;
  loses?: GameEntity;
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

export interface paddleStateI {
  gameName: string;
  paddleY: number;
}

export interface playerDataI {
  name: string;
  score: number;
  paddleY: number;
}

export interface gameStateDataI {
  gameName: string;
  playerFirst: playerDataI;
  playerSecond: playerDataI;
  ball: { x: number; y: number };
}

export interface gameChannelDataI{
  name: string,
  first: string,
  second: string
  guests: string[]
}
