import {
    Controller,
    Get,
    Post,
    Body,
  } from '@nestjs/common';
import { GameService } from './game.service';
import { Game as GameModel} from '@prisma/client';

@Controller()
export class GameController {
    constructor(
        private readonly gameService: GameService,
    ) {}


  @Post('endGame')
  async addGameResult(
    @Body() gameData : {winnerId: number; loserId: number; result: string},
  ): Promise<GameModel> {
      return this.gameService.addGameResult(gameData);
  }


}
