import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { Game as GameModel } from '@prisma/client';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GameEntity } from './entities/game.entity';

@Controller('game')
@ApiTags('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('add')
  @ApiOkResponse({ type: GameEntity })
  async addGameResult(@Body() gameData: CreateGameDto): Promise<GameModel> {
    const { winnerId, loserId, result } = gameData;

    return await this.gameService.addGame({
      winner: {
        connect: { id: winnerId },
      },
      loser: {
        connect: { id: loserId },
      },
      result,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: GameEntity })
  async showGame(@Param('id') id: number): Promise<GameModel> {
    return this.gameService.getGame(id);
  }
}
