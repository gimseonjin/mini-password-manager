import { Module } from '@nestjs/common';
import { VaultService } from './vault.service';
import { VaultRepository } from './vault.repository';

@Module({
  providers: [VaultService, VaultRepository],
  exports: [VaultService],
})
export class VaultModule {}
