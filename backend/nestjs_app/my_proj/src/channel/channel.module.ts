import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
    imports: [],
    controllers : [ChannelController],
    providers : [ChannelService, PrismaService]
})
export class ChannelModule {}
