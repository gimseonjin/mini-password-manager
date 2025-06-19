import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseAdapter } from '../database/database.adapter';
import { User } from './user.interface';

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

  async findBy(
    where: Prisma.userWhereUniqueInput,
    trx?: DatabaseAdapter,
  ): Promise<User | null> {
    const db = trx ?? this.databaseAdapter;
    return db.user.findUnique({
      where,
    });
  }
}
