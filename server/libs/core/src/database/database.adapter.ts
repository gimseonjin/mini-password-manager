import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

type RawQuery = {
  query: string;
  params?: any[];
};

@Injectable()
export class DatabaseAdapter extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
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

  async executeRaw({ query, params }: RawQuery) {
    return this.$executeRawUnsafe(query, ...(params || []));
  }
}
