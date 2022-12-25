import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel as ChannelModel } from '@prisma/client';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChannelEntity } from './entities/channel.entity';

@Controller('channel')
@ApiTags('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('connect')
  @ApiOkResponse({ type: ChannelEntity })
  async addChannel(
    @Body() data: { name: string; ownerId: number },
  ): Promise<ChannelModel> {
    return this.channelService.connectToChannel(data);
  }

  @Post('connectpm')
  @ApiOkResponse({ type: ChannelEntity })
  async addChannelPM(
    @Body() body: { guestId: number; ownerId: number },
  ): Promise<ChannelModel> {
    let channelName = '';
    let owner : number;
    if (body.guestId > body.ownerId) {
      channelName = channelName + body.guestId + body.ownerId;
      owner = body.guestId;
    } else {
      channelName = channelName + body.ownerId + body.guestId;
      owner = body.ownerId
    }
    console.log(channelName);
    const data = {name : channelName, ownerId : owner}
    //// invite user to channel
    return this.channelService.connectToChannel(data);
  }

  @Post('setName')
  @ApiOkResponse({ type: ChannelEntity })
  async setChannelName(
    @Body() data: { oldName: string; newName: string },
  ): Promise<ChannelModel> {
    return this.channelService
      .updateChannel({
        where: { name: data.oldName },
        data: { name: data.newName },
      })
      .then((ret) => {
        console.log('then');
        return ret;
      })
      .catch((error) => {
        console.log('catch');
        throw new BadRequestException(error.code);
      });
  }

  @Get(':id')
  @ApiOkResponse({ type: ChannelEntity })
  async showChannel(@Param() id : string): Promise<ChannelModel> {
    return this.channelService
      .getChannel(id)
      .then((ret) => ret)
      .catch((error) => {
        console.log('catch');
        throw new BadRequestException(error.code);
      });
  }
}
