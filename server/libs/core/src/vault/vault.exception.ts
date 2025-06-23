export class VaultAlreadyExistsError extends Error {
  constructor(vaultName: string) {
    super(`이미 존재하는 Vault 이름입니다: ${vaultName}`);
    this.name = 'VaultAlreadyExistsError';
  }
}

export class VaultNotFoundError extends Error {
  constructor(vaultId: string) {
    super(`존재하지 않는 Vault입니다: ${vaultId}`);
    this.name = 'VaultNotFoundError';
  }
}
