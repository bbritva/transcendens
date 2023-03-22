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
    this.server.of("/").adapter.on("delete-room", (room) => {
      if (room.endsWith("Game")) 
        this.gatewayService.removeGame(room);
    });
  }

  @SubscribeMessage("joinChannel")
  async onJoinChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.joinChannel(socket.id, channelIn);
  }

  @SubscribeMessage("addToChannel")
  async onAddToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.addUserToChannel(socket.id, data);
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
    @MessageBody() data: DTO.ManageUserI
  ) {
    this.gatewayService.connectToChannelPM(socket, data);
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
    this.gatewayService.unmuteUser(socket.id, data);
  }

  @SubscribeMessage("unbanUser")
  async onUnbanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageUserInChannelI
  ) {
    this.gatewayService.unbanUser(socket.id, data);
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


  @SubscribeMessage("gameLine")
  async standInLine(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.gameLineI
  ) {
    this.gatewayService.gameLine(socket, data);
  }

  @SubscribeMessage("inviteToGame")
  async inviteToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.InviteToGameI
  ) {
    this.gatewayService.inviteToGame(socket, data);
  }

  @SubscribeMessage("acceptInvite")
  async acceptInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.AcceptInviteI
  ) {
    this.gatewayService.startGame(socket, data);
  }

  @SubscribeMessage("declineInvite")
  async declineInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.AcceptInviteI
  ) {
    this.gatewayService.sendDecline(socket, data.sender);
  }

  @SubscribeMessage("paddleState")
  async getScore(
    @MessageBody() data: DTO.paddleStateI
  ) {
    this.server.to(data.gameName).volatile.emit("paddleState", data);
    
  }

  @SubscribeMessage("gameState")
  async getCoordinates(
    @MessageBody() data: DTO.gameStateDataI
  ) {
    this.gatewayService.emitGameState(data);
  }

  @SubscribeMessage("setPause")
  async setPause(
    @MessageBody() data:DTO.pauseGameI
  ) {
    this.gatewayService.setPaused(data);
  }

  @SubscribeMessage("endGame")
  async onEndGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.finishGameI
  ) {
    this.gatewayService.finishGame(socket.id, data);
  }

  @SubscribeMessage("getActiveGames")
  async onGetActiveGames(
    @ConnectedSocket() socket: Socket,
  ) {
    this.gatewayService.getActiveGames(socket.id);
  }


  @SubscribeMessage("spectateGame")
  async onSpectateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.spectateGameI

  ) {
    this.gatewayService.connectSpectator(socket.id, data);
  }
}
