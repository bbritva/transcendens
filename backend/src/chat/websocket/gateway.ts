import { OnModuleInit } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { GatewayService } from "./gateway.service";

@WebSocketGateway({
  cors: true,
})
export class Gateway implements OnModuleInit {
  constructor(private readonly gatewayService: GatewayService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.gatewayService.setServer(this.server);
    this.server.on("connection", async (socket) => {
      // check authorisation
      if (!(await this.gatewayService.connectUser(socket))) {
        socket.disconnect(true);
        return;
      }

      //disconnection handler
      socket.on("disconnecting", async () => {
        this.gatewayService.disconnectUser(socket);
      });
      socket.on("disconnect", async () => {});
    });
  }

  @SubscribeMessage("connectToChannel")
  async onConnectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.connectToChannel(socket.id, channelIn);
  }

  @SubscribeMessage("leaveChannel")
  async onLeaveChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.leaveChannel(socket.id, channelIn.name);
  }

  @SubscribeMessage("privateMessage")
  async onPrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.connectToChannelPM(socket, channelIn);
  }

  @SubscribeMessage("inviteToGame")
  async inviteToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.InviteToGameI
  ) {
    console.log("Invite to game");
    this.gatewayService.emitToRecipient("inviteToGame", socket, data.recipient);
  }

  @SubscribeMessage("acceptInvite")
  async acceptInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.AcceptInviteI
  ) {
    console.log("accepted Invite");
    this.gatewayService.emitToRecipient("acceptInvite", socket, data.sender);
  }

  @SubscribeMessage("declineInvite")
  async declineInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.AcceptInviteI
  ) {
    console.log("DECLINE Invite");
    this.gatewayService.emitToRecipient("declineInvite", socket, data.sender);
  }

  @SubscribeMessage("connectToGame")
  async connectToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.gameChannelDataI
  ) {
    this.gatewayService.connectToGame(socket, data);
  }

  @SubscribeMessage("score")
  async getScore(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.scoreDataI
  ) {
    this.server.to(data.game).emit("gameScore", { ...data });
  }

  @SubscribeMessage("coordinates")
  async getCoordinates(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.coordinateDataI
  ) {
    this.gatewayService.getCoordinates(socket, data);
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: CreateMessageDTO
  ) {
    this.gatewayService.newMessage(socket, message);
  }

  @SubscribeMessage("addAdmin")
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.addAdmin(socket.id, data);
  }

  @SubscribeMessage("changeChannelName")
  async onChangeChannelName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ChangeChannelNameI
  ) {
    this.gatewayService.changeChannelName(socket.id, data);
  }

  @SubscribeMessage("setPrivacy")
  async onSetPrivacy(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.SetPrivacyI
  ) {
    this.gatewayService.setPrivacy(socket.id, data);
  }

  @SubscribeMessage("setPassword")
  async onSetPassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.SetPasswordI
  ) {
    this.gatewayService.setPassword(socket.id, data);
  }

  @SubscribeMessage("banUser")
  async onBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.banUser(socket.id, data);
  }

  @SubscribeMessage("muteUser")
  async onMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.muteUser(socket.id, data);
  }

  @SubscribeMessage("unmuteUser")
  async onUnmuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.unmuteUser(socket, data);
  }

  @SubscribeMessage("unbanUser")
  async onUnbanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.unbanUser(socket, data);
  }

  @SubscribeMessage("kickUser")
  async onKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.kickUser(socket.id, data);
  }

  @SubscribeMessage("addFriend")
  async onAddFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.addFriend(socket.id, data);
  }

  @SubscribeMessage("removeFriend")
  async onRemoveFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.removeFriend(socket.id, data);
  }

  @SubscribeMessage("getFriends")
  async onGetFriends(
    @ConnectedSocket() socket: Socket,
  ) {
    this.gatewayService.getFriends(socket.id);
  }
  @SubscribeMessage("banPersonally")
  async onBanPersonally(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.banPersonally(socket.id, data);
  }

  @SubscribeMessage("unbanPersonally")
  async onUnbanPersonally(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.unbanPersonally(socket.id, data);
  }

  @SubscribeMessage("getPersonallyBanned")
  async onGetPersonallyBanned(
    @ConnectedSocket() socket: Socket,
  ) {
    this.gatewayService.getPersonallyBanned(socket.id);
  }

  @SubscribeMessage("getUserStats")
  async onGetUserStats(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.getUserStat(socket.id, data);
  }

  @SubscribeMessage("getLadder")
  async onGetLadder(
    @ConnectedSocket() socket: Socket,
  ) {
    this.gatewayService.getLadder(socket.id);
  }

  @SubscribeMessage("checkNamePossibility")
  async onCheckNamePossibility(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.checkNamePossibility(socket.id, data);
  }

  @SubscribeMessage("getNamesSuggestions")
  async onGetNamesSuggestions(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.getNamesSuggestions(socket.id, data);
  }
}
