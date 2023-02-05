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
  cors: true
})
export class Gateway implements OnModuleInit {
  constructor(
    private readonly gatewayService: GatewayService,
  ) {}
  
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.gatewayService.setServer(this.server);
    this.server.on("connection", async (socket) => {
      console.log("connection");

      // check authorisation
      if (! await this.gatewayService.connectUser(socket)) {
        socket.disconnect(true);
        return;
      }

      //disconnection handler
      socket.on("disconnecting", async () => {
        this.gatewayService.disconnectUser(socket);
      });
      socket.on("disconnect", async () => { });
    });
  }

  @SubscribeMessage("connectToChannel")
  async onConnectToChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    
    this.gatewayService.connectToChannel(socket, channelIn);
  }

  @SubscribeMessage("leaveChannel")
  async onLeaveChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.leaveChannel(
      socket.id,
      channelIn.name
    );
  }

  @SubscribeMessage("privateMessage")
  async onPrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelIn: DTO.ChannelInfoIn
  ) {
    this.gatewayService.connectToChannelPM(socket, channelIn);
  }

  @SubscribeMessage('inviteToGame')
  async inviteToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { recipient: string }
  ){
    console.log("Invite to game")
    this.gatewayService.emitToRecipient('inviteToGame', socket, data.recipient)
  }

  @SubscribeMessage('acceptInvite')
  async acceptInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { sender: string }
  ){
    console.log("accepted Invite")
    this.gatewayService.emitToRecipient('acceptInvite', socket, data.sender)
  }

  @SubscribeMessage('declineInvite')
  async declineInvite(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { sender: string }
  ){
    console.log("DECLINE Invite")
    this.gatewayService.emitToRecipient('declineInvite', socket, data.sender)
  }

  @SubscribeMessage("score")
  async getScore(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.scoreDataI
  ){
    this.server.to(data.game).emit("gameScore", { ...data });
  }

  @SubscribeMessage("coordinates")
  async getCoordinates(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.coordinateDataI
  ){
    this.gatewayService.getCoordinates(socket, data);
  }

  @SubscribeMessage("connectToGame")
  async connectToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.gameChannelDataI
  ){
    this.gatewayService.connectToGame(socket, data);
  }

  @SubscribeMessage("newMessage")
  async onNewMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: CreateMessageDTO
  ) {
    this.gatewayService.newMessage(socket, message)
  }

  @SubscribeMessage("addAdmin")
  async onAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.addAdmin(socket, data);
  }

  @SubscribeMessage("setPrivacy")
  async onSetPrivacy(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.setPrivacy(socket, data);
  }

  @SubscribeMessage("setPassword")
  async onSetPassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.setPassword(socket, data);
  }

  @SubscribeMessage("banUser")
  async onBanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.banUser(socket, data);
  }

  @SubscribeMessage("muteUser")
  async onMuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.muteUser(socket, data);
  }

  @SubscribeMessage("unmuteUser")
  async onUnmuteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.unmuteUser(socket, data);
  }

  @SubscribeMessage("unbanUser")
  async onUnbanUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.unbanUser(socket, data);
  }

  @SubscribeMessage("kickUser")
  async onKickUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: DTO.ManageChannel
  ) {
    this.gatewayService.kickUser(
      socket,
      data,
    );
  }
}
