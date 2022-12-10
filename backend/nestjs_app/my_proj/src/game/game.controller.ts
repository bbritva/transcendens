import {
    Controller,
    Get,
    Post,
    Body,
  } from '@nestjs/common';
import { GameService } from './game.service';
import { UserService } from '../user/user.service'
import { Game as GameModel} from '@prisma/client';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly userService: UserService,
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
    // const winner = await this.userService.getUser(gameData.winnerId)
    // winner.winIds.push(game.id);
    // this.userService.updateUser({
    //   where: { id: Number(winner.id) },
    //   data: { winIds: winner.winIds },
    // });
    // console.log(winner.winIds);
    // console.log(await this.userService.getUser(gameData.winnerId));
    // (await this.userService.getUser(gameData.winnerId))
    // const loser = await this.userService.getUser(gameData.loserId)
    // loser.loseIds.push(game.id);
  }


}
