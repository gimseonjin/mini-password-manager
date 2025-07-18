export interface Vault {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: VaultItem[];
}

export interface VaultItem {
  id: string;
  vaultId: string;
  type: string;
  title: string;
  encryptedBlob: string;
  encryption: VaultEncryption | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultEncryption {
  algorithm: 'AES-GCM';
  iv: string;
  salt: string;
  kdf: 'Argon2id';
  iterations: number;
}

export interface CreateVault {
  userId: string;
  vaultName: string;
  description?: string;
}

export interface DeleteVault {
  vaultId: string;
  userId: string;
}

export interface DeleteAllVaults {
  userId: string;
}

export interface GetVaults {
  userId: string;
}

export interface AddVaultItem {
  userId: string;
  vaultId: string;
  item: Omit<VaultItem, 'id' | 'vaultId' | 'createdAt' | 'updatedAt'>;
}

export interface GetVaultItem {
  userId: string;
  vaultId: string;
}