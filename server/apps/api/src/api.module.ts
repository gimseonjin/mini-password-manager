import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CoreModule } from '@app/core';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user/user.controller';
import { VaultController } from './vault/vault.controller';
import { VaultItemController } from './vault/vault-item.controller';

@Module({
  imports: [CoreModule, TerminusModule, HttpModule],
  controllers: [
    ApiController,
    UserController,
    VaultController,
    VaultItemController,
  ],
})
export class ApiModule {}
