import { Injectable } from '@nestjs/common';
import {
  CreateVault,
  DeleteAllVaults,
  DeleteVault,
  GetVaults,
  Vault,
} from './vault.interface';
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

  /**
   * 사용자의 Vault 목록을 조회한다.
   *
   * @param param0 - 사용자 ID
   * @returns 사용자의 Vault 목록
   */
  async getVaults({ userId }: GetVaults): Promise<Vault[]> {
    return this.vaultRepository.findAllBy({ userId });
  }

  /**
   * 사용자의 Vault를 삭제한다.
   *
   * @param param0 - Vault 삭제 정보 객체
   *   - vaultId: 삭제할 Vault의 ID
   *   - userId: Vault를 소유한 사용자의 ID
   * @returns void
   */
  async deleteValut({ vaultId, userId }: DeleteVault): Promise<void> {
    const vault = await this.vaultRepository.findBy({ id: vaultId, userId });
    if (!vault) {
      return;
    }

    return this.vaultRepository.delete({ id: vaultId });
  }

  /**
   * 사용자의 모든 Vault를 삭제한다.
   *
   * @param param0 - 사용자 ID
   * @returns void
   */
  async deleteAllVaults({ userId }: DeleteAllVaults): Promise<void> {
    const vaults = await this.vaultRepository.findAllBy({ userId });
    if (!vaults || vaults.length === 0) {
      return;
    }

    await this.vaultRepository.deleteAllBy({ userId });
  }
}
