import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CoreModule } from '@app/core';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user.controller';

@Module({
  imports: [CoreModule, TerminusModule, HttpModule],
  controllers: [ApiController, UserController],
})
export class ApiModule {}
