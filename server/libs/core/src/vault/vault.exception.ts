export class VaultAlreadyExistsError extends Error {
  constructor(vaultName: string) {
    super(`이미 존재하는 Vault 이름입니다: ${vaultName}`);
    this.name = 'VaultAlreadyExistsError';
  }
}
