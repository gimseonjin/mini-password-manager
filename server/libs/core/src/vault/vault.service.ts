import { Injectable } from '@nestjs/common';
import { CreateVault, Vault } from './vault.interface';
import { VaultRepository } from './vault.repository';
import { VaultAlreadyExistsError } from './vault.exception';

@Injectable()
export class VaultService {
  constructor(private readonly vaultRepository: VaultRepository) {}

  /**
   * 사용자의 새 Vault를 생성한다.
   *
   * @param param0 - Vault 생성 정보 객체
   *   - userId: 사용자의 ID
   *   - vaultName: Vault의 이름
   *   - description: Vault의 설명 (선택 사항)
   * @returns 새로 생성된 Vault 객체
   * @throws VaultAlreadyExistsError - 동일한 이름의 Vault가 이미 존재하는 경우
   */
  async createVault({
    userId,
    vaultName,
    description,
  }: CreateVault): Promise<Vault> {
    const isExistUser = await this.vaultRepository.existsBy({
      userId,
      name: vaultName,
    });
    if (isExistUser) {
      throw new VaultAlreadyExistsError(vaultName);
    }

    const vault = {
      name: vaultName,
      userId,
      description: description || '',
    };

    return this.vaultRepository.create(vault);
  }
}
