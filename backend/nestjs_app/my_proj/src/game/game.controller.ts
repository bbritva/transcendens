import {
    Controller,
    Get,
    Post,
    Body,
  } from '@nestjs/common';
import { GameService } from './game.service';
import { Game as GameModel} from '@prisma/client';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
    ) {}


  @Post('add')
  async addGameResult(
    @Body() gameData : {winnerId: number; loserId: number; result: string},
  ): Promise<GameModel> {
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


}
