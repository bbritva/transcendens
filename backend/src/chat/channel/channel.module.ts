import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChannelController } from 'src/chat/channel/channel.controller';
import { ChannelService } from 'src/chat/channel/channel.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule, JwtModule],
    exports: [ChannelService],
    controllers : [ChannelController],
    providers : [ChannelService]
})
export class ChannelModule {}
