import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseAdapter } from '../database/database.adapter';

@Injectable()
export class UserRepository {
  constructor(private readonly databaseAdapter: DatabaseAdapter) {}

  async save(
    { name, email, encryptedPassword }: Prisma.userCreateInput,
    trx?: DatabaseAdapter,
  ): Promise<User> {
    const db = trx ?? this.databaseAdapter;
    return db.user.create({
      data: { name, email, encryptedPassword },
    });
  }

  async existsBy(
    { email }: Prisma.userWhereUniqueInput,
    trx?: DatabaseAdapter,
  ): Promise<boolean> {
    const db = trx ?? this.databaseAdapter;
    const user = await db.user.findUnique({
      where: { email },
    });
    return !!user;
  }
}
