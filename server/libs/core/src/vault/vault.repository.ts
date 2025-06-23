import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseAdapter } from '../database/database.adapter';
import { Vault, VaultEncryption, VaultItem } from './vault.interface';
import { JsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class VaultRepository {
  constructor(private readonly databaseAdapter: DatabaseAdapter) {}

  async create(
    { name, userId, description }: Prisma.vaultCreateInput,
    trx?: DatabaseAdapter,
  ): Promise<Vault> {
    const db = trx ?? this.databaseAdapter;
    const vault = await db.vault.create({
      data: { name, userId, description },
      include: {
        items: true,
      },
    });

    return {
      id: vault.id,
      userId: vault.userId,
      name: vault.name,
      description: vault.description,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
      items: vault.items.map((item) => ({
        id: item.id,
        vaultId: item.vaultId,
        type: item.type,
        title: item.title,
        encryptedBlob: item.encryptedBlob,
        encryption: this.normalizeEncryption(item.encryption),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  async existsBy(
    { userId, name }: Prisma.vaultWhereInput,
    trx?: DatabaseAdapter,
  ): Promise<boolean> {
    const db = trx ?? this.databaseAdapter;
    const vault = await db.vault.findFirst({
      where: { userId, name },
    });
    return !!vault;
  }

  async findBy(
    where: Prisma.vaultWhereInput,
    trx?: DatabaseAdapter,
  ): Promise<Vault | null> {
    const db = trx ?? this.databaseAdapter;
    const vault = await db.vault.findFirst({
      where,
      include: {
        items: true,
      },
    });
    if (!vault) return null;

    return {
      id: vault.id,
      userId: vault.userId,
      name: vault.name,
      description: vault.description,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
      items: vault.items.map((item) => ({
        id: item.id,
        vaultId: item.vaultId,
        type: item.type,
        title: item.title,
        encryptedBlob: item.encryptedBlob,
        encryption: this.normalizeEncryption(item.encryption),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  async findAllBy(
    where: Prisma.vaultWhereInput,
    trx?: DatabaseAdapter,
  ): Promise<Vault[]> {
    const db = trx ?? this.databaseAdapter;
    const vaults = await db.vault.findMany({
      where,
      include: {
        items: true,
      },
    });

    return vaults.map((v) => ({
      id: v.id,
      userId: v.userId,
      name: v.name,
      description: v.description,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      items: v.items.map((item) => ({
        id: item.id,
        vaultId: item.vaultId,
        type: item.type,
        title: item.title,
        encryptedBlob: item.encryptedBlob,
        encryption: this.normalizeEncryption(item.encryption),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    }));
  }

  async delete(
    { id }: Prisma.vaultWhereUniqueInput,
    trx?: DatabaseAdapter,
  ): Promise<void> {
    const db = trx ?? this.databaseAdapter;
    await db.vault.delete({
      where: { id },
    });
  }

  async deleteAllBy(
    where: Prisma.vaultWhereInput,
    trx?: DatabaseAdapter,
  ): Promise<void> {
    const db = trx ?? this.databaseAdapter;
    await db.vault.deleteMany({
      where,
    });
  }

  async addItem(
    vaultId: string,
    itemData: Omit<VaultItem, 'id' | 'vaultId' | 'createdAt' | 'updatedAt'>,
    trx?: DatabaseAdapter,
  ): Promise<Vault> {
    const db = trx ?? this.databaseAdapter;

    const prismaReadyItem: Prisma.vault_itemCreateInput = {
      type: itemData.type,
      title: itemData.title,
      encryptedBlob: itemData.encryptedBlob,
      encryption: itemData.encryption
        ? (itemData.encryption as unknown as Prisma.InputJsonObject)
        : Prisma.JsonNull,
      vault: { connect: { id: vaultId } },
    };

    const vault = await db.vault.update({
      where: { id: vaultId },
      data: {
        items: {
          create: [prismaReadyItem],
        },
      },
      include: { items: true },
    });

    return {
      id: vault.id,
      userId: vault.userId,
      name: vault.name,
      description: vault.description,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
      items: vault.items.map((item) => ({
        id: item.id,
        vaultId: item.vaultId,
        type: item.type,
        title: item.title,
        encryptedBlob: item.encryptedBlob,
        encryption: this.normalizeEncryption(item.encryption),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  private normalizeEncryption(encryption: JsonValue): VaultEncryption | null {
    if (encryption === null) return null;
    if (typeof encryption === 'object')
      return encryption as unknown as VaultEncryption;
    if (typeof encryption === 'string')
      return JSON.parse(encryption) as VaultEncryption;
    throw new Error('Invalid encryption format');
  }
}
