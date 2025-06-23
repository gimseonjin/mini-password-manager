import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { VaultModule } from './vault/vault.module';

@Module({
  imports: [UserModule, DatabaseModule, AuthModule, VaultModule],
  exports: [UserModule, DatabaseModule, AuthModule, VaultModule],
})
export class CoreModule {}
