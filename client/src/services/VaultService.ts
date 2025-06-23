import {
  CreateVaultRequest,
  CreateVaultResponse,
} from '../types/vault'
import {
  httpRequest,
  ApiRequestError,
} from './httpClient'

// Vault API 함수들

/**
 * 새로운 Vault를 생성합니다.
 * @param vaultData - Vault 생성에 필요한 데이터
 * @returns 생성된 Vault 정보
 */
export async function createVault(
  vaultData: CreateVaultRequest
): Promise<CreateVaultResponse> {
  try {
    const response = await httpRequest<CreateVaultResponse>(
      '/api/v1/vaults',
      {
        method: 'POST',
        body: JSON.stringify(vaultData),
      }
    )

    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
      if (error.status === 409) {
        throw new Error('이미 존재하는 Vault 이름입니다.')
      }
    }
    throw error
  }
}

/**
 * 특정 Vault를 삭제합니다.
 * @param vaultId - 삭제할 Vault의 ID
 */
export async function deleteVault(vaultId: string): Promise<void> {
  try {
    await httpRequest<void>(`/api/v1/vaults/${vaultId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
      if (error.status === 404) {
        throw new Error('Vault를 찾을 수 없습니다.')
      }
    }
    throw error
  }
}

/**
 * 사용자의 모든 Vault를 삭제합니다.
 */
export async function deleteAllVaults(): Promise<void> {
  try {
    await httpRequest<void>('/api/v1/vaults/all', {
      method: 'DELETE',
    })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
    }
    throw error
  }
} 