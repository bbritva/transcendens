import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MessageService } from "src/chat/message/message.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { Gateway } from "./gateway";
import { UserModule } from "src/user/user.module";
import { ChannelModule } from "src/chat/channel/channel.module";
import { GatewayService } from "./gateway.service";

@Module({
    imports: [PrismaModule, UserModule, ChannelModule, JwtModule],
    providers: [Gateway, MessageService, Object, GatewayService]
})
export class GatewayModule{}