import { Global, Module } from '@nestjs/common';
import { DatabaseAdapter } from './database.adapter';

@Global()
@Module({
  providers: [DatabaseAdapter],
  exports: [DatabaseAdapter],
})
export class DatabaseModule {}
