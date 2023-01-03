import { Module } from '@nestjs/common';
import { ChannelController } from 'src/chat/channel/channel.controller';
import { ChannelService } from 'src/chat/channel/channel.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers : [ChannelController],
    providers : [ChannelService]
})
export class ChannelModule {}
