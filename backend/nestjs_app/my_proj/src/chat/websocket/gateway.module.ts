import { Module } from "@nestjs/common";
import { ChannelService } from "src/chat/channel/channel.service";
import { MessageService } from "src/chat/message/message.service";
import { PrismaService } from "src/prisma.service";
import { Gateway } from "./gateway";

@Module({
    providers: [Gateway, ChannelService, PrismaService, MessageService]
})
export class GatewayModule{}