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
import { SetChannelNameDto } from './dto/setChannelName.dto';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('channel')
@ApiTags('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('connect')
  @ApiOkResponse({ type: ChannelEntity })
  async addChannel(
    @Body() data: CreateChannelDto,
  ): Promise<ChannelModel> {
    return this.channelService.connectToChannel(data);
  }

  @Post('setName')
  @ApiOkResponse({ type: ChannelEntity })
  async setChannelName(
    @Body() data: SetChannelNameDto,
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
