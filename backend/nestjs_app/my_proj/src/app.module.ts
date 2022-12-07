import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

//services
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { PrismaService } from './prisma.service';

const confS = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: confS.get('POSTGRES_HOST'),
      port: confS.get('POSTGRES_PORT'),
      username: confS.get('POSTGRES_USERNAME'),
      password: confS.get('POSTGRES_PASSWORD'),
      database: confS.get('POSTGRES_DATABASE'),
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [
    AppController
  ],
  providers: [PrismaService, AppService, UserService, PostService],
})
export class AppModule {
  constructor(public dataSource: DataSource) {}
}
