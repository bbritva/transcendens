import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ChannelController } from 'src/channel/channel.controller';
import { ChannelService } from 'src/channel/channel.service';

@Module({
    imports: [],
    controllers : [ChannelController],
    providers : [ChannelService, PrismaService]
})
export class ChannelModule {}
