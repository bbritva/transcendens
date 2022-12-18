import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    BadRequestException,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel as ChannelModel } from '@prisma/client';



@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
    ) { }


    @Post('connect')
    async addChannel(
        @Body() data: { name: string, ownerId: number},
    ): Promise<ChannelModel> {
        return this.channelService.connectToChannel(data)
    }

    @Post('setName')
    async setChannelName(
        @Body() data: { oldName: string; newName: string },
        ): Promise<ChannelModel> {
        return this.channelService.updateChannel({
            where: { name: data.oldName },
            data: { name: data.newName },
        })
            .then(ret => {
                console.log("then");
                return ret;
            })
            .catch(error => {
                console.log("catch");
                throw new BadRequestException(error.code);
            });
    }

    @Get('show')
    async showChannel(
        @Body('name') name: string,
    ): Promise<ChannelModel> {
        return this.channelService.getChannel(name)
        .then(ret => ret)
        .catch(error => {
            console.log("catch");
            throw new BadRequestException(error.code);
        }
        )
    }
}
