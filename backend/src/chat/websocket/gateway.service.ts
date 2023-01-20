import { Server, Socket } from "socket.io";
import { CreateMessageDTO } from "src/chat/message/dto/create-message.dto";
import * as DTO from "./websocket.dto";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/chat/channel/channel.service";
import { ChannelEntity } from "src/chat/channel/entities/channel.entity";
import { env } from "process";
import { JwtService } from "@nestjs/jwt";

export class GatewayService {
  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private jwtService: JwtService
  ) {}

  connections: Map<string, DTO.ClientInfo> = new Map();
  server: Server;

  setServer(server: Server) {
    if (server == undefined) {
      this.server = server;
      console.log("server set");      
    }
  }

  connectionSet(client: DTO.ClientInfo, socket: Socket) {
    this.connections.set(socket.id, client);
  }

  async kickUser(
    executor: DTO.ClientInfo,
    data: DTO.ManageChannel,
    server: Server
  ) {
    const channel = await this.channelService.getChannel(data.name);
    if (channel.admIds.includes(executor.id)) {
      const targetUser = await this.userService.getUserByName(data.params[0]);
      this.leaveChannel(server, executor.socketId, data.name, targetUser);
      server.to(executor.socketId).emit("userKicked", data);
    } else server.to(executor.socketId).emit("notAllowed", data);
  }

  async leaveChannel(
    server: Server,
    socketId: string,
    channelName: string,
    user: DTO.ClientInfo
  ) {
    const channel = await this.channelService.updateChannel({
      where: {
        name: channelName,
      },
      data: {
        guests: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });
    // notice user
    server.to(socketId).emit("leftChannel", channelName);
    // exit room
    server.in(socketId).socketsLeave(channelName);
    // notice channel
    server
      .to(channelName)
      .emit(
        "userLeft",
        channel.name,
        await this.userService.getUser(
          this.connections.get(socketId).id,
          false,
          false
        )
      );
  }
}
