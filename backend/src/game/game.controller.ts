import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { GameService } from "./game.service";
import { Game as GameModel } from "@prisma/client";
import { GameResultDto } from "./dto/create-game.dto";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GameEntity } from "./entities/game.entity";

@Controller("game")
@ApiTags("game")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post("add")
  @ApiOkResponse({ type: GameEntity })
  async addGameResult(@Body() gameData: GameResultDto): Promise<GameModel> {
    return this.gameService
      .addGame(gameData)
      .then((ret) => ret)
      .catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  @Get(":id")
  @ApiOkResponse({ type: GameEntity })
  async showGame(@Param("id") id: number): Promise<GameModel> {
    return this.gameService.getGame(id);
  }
}
