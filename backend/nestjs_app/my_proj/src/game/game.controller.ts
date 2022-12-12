import {
    Controller,
    Get,
    Post,
    Body,
  } from '@nestjs/common';
import { GameService } from './game.service';
import { Game as GameModel} from '@prisma/client';
import { GameDto } from './game.dto';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
    ) {}


  @Post('add')
  async addGameResult( @Body() gameData : GameDto): Promise<GameModel> {
    const { winnerId, loserId, result } = gameData;

    return await this.gameService.addGame({
        winner: { 
          connect: { id : winnerId }
        },
        loser: { 
          connect: { id : loserId }
        },
        result
      });
  }

  @Get('show')
  async showGame(
      @Body('id') gameId: number,
  ): Promise<GameModel> {
      return this.gameService.getGame(gameId);
  }


}
