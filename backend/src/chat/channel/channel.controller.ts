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
import { Public } from 'src/auth/constants';

@Controller('channel')
@ApiTags('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  // @Public()
  // @Post('connect')
  // @ApiOkResponse({ type: ChannelEntity })
  // async addChannel(
  //   @Body() data: CreateChannelDto,
  // ): Promise<ChannelModel> {
  //   return this.channelService.connectToChannel(data);
  // }

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
        return ret;
      })
      .catch((error) => {
        throw new BadRequestException(error.code);
      });
  }

  @Public()
  @Get(':name')
  @ApiOkResponse({ type: ChannelEntity })
  async showChannel(@Param('name') name : string): Promise<ChannelModel> {
    return this.channelService
      .getChannel(name)
      .then((ret) => ret)
      .catch((error) => {
        throw new BadRequestException(error.code);
      });
  }
}
