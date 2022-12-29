import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Request,
  UseGuards
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from './auth/constants';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}
  
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}