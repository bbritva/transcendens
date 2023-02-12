import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
    imports: [PrismaModule, UserModule],
    exports: [GameService],
    controllers : [GameController],
    providers : [GameService]
})
export class GameModule {}
