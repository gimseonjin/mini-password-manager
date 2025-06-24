import {
  CreateVaultRequest,
  CreateVaultResponse,
  FetchVaultsResponse,
  VaultItem,
  CreateVaultItemRequest,
  CreateVaultItemResponse,
  UpdateVaultItemRequest,
  VaultItemData,
  EncryptedData,
  EncryptionOptions,
  AddVaultItemRequestDto,
  AddVaultItemResponseDto,
  VaultItemDto,
} from '../types/vault'
import {
  httpRequest,
  ApiRequestError,
} from './httpClient'
import CryptoService from './CryptoService'

// Vault API 함수들

/**
 * 사용자의 모든 Vault 목록을 조회합니다.
 * @returns Vault 목록
 */
export async function getVaults(): Promise<FetchVaultsResponse[]> {
  try {
    const response = await httpRequest<FetchVaultsResponse[]>('/api/v1/vaults')
    
    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
    }
    throw error
  }
}

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
    await httpRequest<void>('/api/v1/vaults', {
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

// Vault Item 관련 함수들 (암호화 지원)

/**
 * API 스펙에 맞춰 특정 Vault의 모든 Item을 조회합니다 (암호화된 상태로).
 * @param vaultId - Vault ID
 * @returns 암호화된 VaultItemDto 목록
 */
export async function getVaultItemsRaw(vaultId: string): Promise<VaultItemDto[]> {
  try {
    const response = await httpRequest<VaultItemDto[]>(`/api/v1/vaults/${vaultId}/items`)
    return response
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
 * 특정 Vault의 모든 Item을 조회하고 복호화합니다.
 * @param vaultId - Vault ID
 * @param secretKey - 복호화에 사용할 시크릿 키
 * @returns 복호화된 VaultItem 목록
 */
export async function getVaultItems(
  vaultId: string,
  secretKey: string
): Promise<VaultItem[]> {
  try {
    const response = await httpRequest<any[]>(`/api/v1/vaults/${vaultId}/items`)
    
    // 각 아이템의 데이터를 복호화
    const decryptedItems: VaultItem[] = []
    
    for (const item of response) {
      try {
        // 암호화된 데이터가 있는 경우 복호화
        if (item.encryptedData) {
          const decryptedData = await CryptoService.decrypt(
            item.encryptedData as EncryptedData,
            secretKey
          )
          
          const parsedData = JSON.parse(decryptedData) as VaultItemData
          
          decryptedItems.push({
            ...item,
            data: parsedData
          })
        } else {
          // 암호화되지 않은 기존 데이터 처리
          decryptedItems.push(item)
        }
      } catch (decryptError) {
        console.error(`아이템 ${item.id} 복호화 실패:`, decryptError)
        // 복호화에 실패한 아이템은 제외하고 계속 진행
      }
    }
    
    return decryptedItems
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
 * API 스펙에 맞춰 특정 Vault의 모든 Item을 조회하고 복호화합니다.
 * @param vaultId - Vault ID
 * @param secretKey - 복호화에 사용할 시크릿 키
 * @returns 복호화된 데이터를 포함한 VaultItemDto 목록
 */
export async function getVaultItemsDecrypted(
  vaultId: string,
  secretKey: string
): Promise<(VaultItemDto & { decryptedData?: any })[]> {
  try {
    const response = await getVaultItemsRaw(vaultId)
    
    // 각 아이템의 데이터를 복호화
    const decryptedItems: (VaultItemDto & { decryptedData?: any })[] = []
    
    for (const item of response) {
      try {
        // encryptedBlob을 복호화
        if (item.encryptedBlob && item.encryption) {
          const encryptedData: EncryptedData = {
            data: item.encryptedBlob,
            metadata: {
              algorithm: item.encryption.algorithm,
              iv: item.encryption.iv,
              salt: item.encryption.salt,
              kdf: item.encryption.kdf,
              iterations: item.encryption.iterations
            }
          }
          
          const decryptedDataString = await CryptoService.decrypt(
            encryptedData,
            secretKey
          )
          
          const decryptedData = JSON.parse(decryptedDataString)
          
          decryptedItems.push({
            ...item,
            decryptedData
          })
        } else {
          // 암호화되지 않은 아이템 처리
          decryptedItems.push(item)
        }
      } catch (decryptError) {
        console.error(`아이템 ${item.id} 복호화 실패:`, decryptError)
        // 복호화에 실패한 아이템도 포함 (encryptedBlob 상태로)
        decryptedItems.push(item)
      }
    }
    
    return decryptedItems
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
 * API 스펙에 맞춰 새로운 VaultItem을 생성합니다.
 * @param vaultId - Vault ID
 * @param itemData - 생성할 아이템 데이터 (API 스펙 형식)
 * @returns API 응답
 */
export async function addVaultItem(
  vaultId: string,
  itemData: AddVaultItemRequestDto
): Promise<AddVaultItemResponseDto> {
  try {
    const response = await httpRequest<AddVaultItemResponseDto>(
      `/api/v1/vaults/${vaultId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(itemData),
      }
    )

    return response
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
 * VaultItem 데이터를 암호화하여 API 스펙에 맞게 추가합니다.
 * @param vaultId - Vault ID
 * @param type - 아이템 타입 (login, note, card 등)
 * @param title - 아이템 제목
 * @param data - 암호화할 데이터 객체
 * @param masterPassword - 암호화에 사용할 마스터 비밀번호
 * @param encryptionOptions - 암호화 옵션
 * @returns API 응답
 */
export async function addVaultItemWithEncryption(
  vaultId: string,
  type: string,
  title: string,
  data: any,
  secretKey: string,
  encryptionOptions?: EncryptionOptions
): Promise<AddVaultItemResponseDto> {
  try {
    // 데이터를 JSON으로 직렬화하고 암호화
    const serializedData = JSON.stringify(data)
    const encryptedData = await CryptoService.encrypt(
      serializedData,
      secretKey,
      encryptionOptions
    )

    // API 스펙에 맞는 요청 데이터 생성
    const requestData: AddVaultItemRequestDto = {
      type,
      title,
      encryptedBlob: encryptedData.data,
      encryption: {
        algorithm: encryptedData.metadata.algorithm,
        iv: encryptedData.metadata.iv,
        salt: encryptedData.metadata.salt,
        kdf: encryptedData.metadata.kdf,
        iterations: encryptedData.metadata.iterations
      }
    }

    return await addVaultItem(vaultId, requestData)
  } catch (error) {
    throw new Error(`아이템 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

/**
 * 새로운 VaultItem을 생성하고 데이터를 암호화합니다. (기존 방식)
 * @param itemData - 생성할 아이템 데이터
 * @param secretKey - 암호화에 사용할 시크릿 키
 * @param encryptionOptions - 암호화 옵션
 * @returns 생성된 VaultItem
 */
export async function createVaultItem(
  itemData: CreateVaultItemRequest,
  secretKey: string,
  encryptionOptions?: EncryptionOptions
): Promise<CreateVaultItemResponse> {
  try {
    // 데이터 암호화
    const serializedData = JSON.stringify(itemData.data)
    const encryptedData = await CryptoService.encrypt(
      serializedData,
      secretKey,
      encryptionOptions
    )

    // 암호화된 데이터와 함께 요청 생성
    const requestData = {
      vaultId: itemData.vaultId,
      type: itemData.type,
      name: itemData.name,
      favorite: itemData.favorite || false,
      folder: itemData.folder,
      notes: itemData.notes,
      encryptedData: encryptedData
    }

    const response = await httpRequest<any>(
      `/api/v1/vaults/${itemData.vaultId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      }
    )

    // 응답에서 원본 데이터 반환
    return {
      ...response,
      data: itemData.data
    }
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
 * VaultItem을 업데이트하고 데이터를 암호화합니다.
 * @param itemData - 업데이트할 아이템 데이터
 * @param secretKey - 암호화에 사용할 시크릿 키
 * @param encryptionOptions - 암호화 옵션
 * @returns 업데이트된 VaultItem
 */
export async function updateVaultItem(
  itemData: UpdateVaultItemRequest,
  secretKey: string,
  encryptionOptions?: EncryptionOptions
): Promise<VaultItem> {
  try {
    let requestData: any = {
      name: itemData.name,
      favorite: itemData.favorite,
      folder: itemData.folder,
      notes: itemData.notes
    }

    // 데이터가 업데이트되는 경우 암호화
    if (itemData.data) {
      const serializedData = JSON.stringify(itemData.data)
      const encryptedData = await CryptoService.encrypt(
        serializedData,
        secretKey,
        encryptionOptions
      )
      requestData.encryptedData = encryptedData
    }

    const response = await httpRequest<any>(
      `/api/v1/vaults/items/${itemData.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(requestData),
      }
    )

    // 응답에서 복호화된 데이터와 함께 반환
    let decryptedData = null
    if (response.encryptedData) {
      const decryptedDataStr = await CryptoService.decrypt(
        response.encryptedData as EncryptedData,
        secretKey
      )
      decryptedData = JSON.parse(decryptedDataStr)
    }

    return {
      ...response,
      data: decryptedData || itemData.data
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
      if (error.status === 404) {
        throw new Error('아이템을 찾을 수 없습니다.')
      }
    }
    throw error
  }
}

/**
 * VaultItem을 삭제합니다.
 * @param itemId - 삭제할 아이템 ID
 */
export async function deleteVaultItem(itemId: string): Promise<void> {
  try {
    await httpRequest<void>(`/api/v1/vaults/items/${itemId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('인증이 필요합니다.')
      }
      if (error.status === 404) {
        throw new Error('아이템을 찾을 수 없습니다.')
      }
    }
    throw error
  }
}

/**
 * Vault의 모든 데이터를 내보내기합니다 (복호화된 상태).
 * @param vaultId - Vault ID
 * @param secretKey - 복호화에 사용할 시크릿 키
 * @returns 복호화된 Vault 데이터
 */
export async function exportVaultData(
  vaultId: string,
  secretKey: string
): Promise<{
  vault: FetchVaultsResponse
  items: VaultItem[]
}> {
  try {
    const [vaults, items] = await Promise.all([
      getVaults(),
      getVaultItems(vaultId, secretKey)
    ])

    const vault = vaults.find(v => v.id === vaultId)
    if (!vault) {
      throw new Error('Vault를 찾을 수 없습니다.')
    }

    return {
      vault,
      items
    }
  } catch (error) {
    throw new Error(`데이터 내보내기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 암호화 관련 유틸리티 함수들
export { CryptoService } 