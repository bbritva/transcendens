import { Module } from "@nestjs/common";
import { ChannelService } from "src/chat/channel/channel.service";
import { MessageService } from "src/chat/message/message.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { Gateway } from "./gateway";

@Module({
    imports: [PrismaModule],
    providers: [Gateway, ChannelService, MessageService]
})
export class GatewayModule{}