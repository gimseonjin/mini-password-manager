import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class DatabaseAdapter extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  asTransactionManager(tx: Prisma.TransactionClient): DatabaseAdapter {
    const proxy = new Proxy(this, {
      get: (target, prop) => {
        if (prop in tx) return tx[prop];
        return (target as any)[prop];
      },
    });
    return proxy as DatabaseAdapter;
  }
}
