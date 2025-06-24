// Vault 관련 타입 정의

export interface CreateVaultRequest {
  vaultName: string
  description?: string
}

export interface CreateVaultResponse {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Vault {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface FetchVaultsResponse {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface VaultApiError {
  message: string
  status: number
}

// 암호화 관련 타입 정의 (API 스펙에 맞춰 업데이트)
export interface EncryptionMetadata {
  algorithm: 'AES-GCM'
  iv: string // base64 encoded initialization vector
  salt: string // base64 encoded salt for key derivation
  kdf: 'Argon2id'
  iterations: number
}

export interface EncryptedData {
  data: string // base64 encoded encrypted data
  metadata: EncryptionMetadata
}

export interface EncryptionOptions {
  iterations?: number // default: 100000
  memorySize?: number // default: 64MB for Argon2
  parallelism?: number // default: 1
}

// API 스펙에 맞는 새로운 타입들
export interface AddVaultItemRequestDto {
  type: string // 아이템 타입 (예: login, note, card)
  title: string // 아이템 제목
  encryptedBlob: string // 암호화된 데이터 블롭
  encryption: {
    algorithm: 'AES-GCM'
    iv: string // base64 encoded initialization vector
    salt: string // base64 encoded salt
    kdf: 'Argon2id'
    iterations: number
  }
}

export interface VaultItemDto {
  id: string // 아이템 ID
  type: string // 아이템 타입
  title: string // 아이템 제목
  encryptedBlob: string // 암호화된 데이터 블롭
  encryption: {
    algorithm: 'AES-GCM'
    iv: string // base64 encoded initialization vector
    salt: string // base64 encoded salt
    kdf: 'Argon2id'
    iterations: number
  } | null
  createdAt: string // 생성 시간
  updatedAt: string // 수정 시간
}

export interface AddVaultItemResponseDto {
  id: string // Vault ID
  createdAt: string // Vault 생성 시간
  updatedAt: string // Vault 수정 시간
  items: VaultItemDto[] // Vault 내 모든 아이템 목록
}

// Vault Item 관련 타입 정의

export enum VaultItemType {
  ACCOUNT = 'ACCOUNT',
  SECURE_NOTE = 'SECURE_NOTE',
  CARD = 'CARD',
  IDENTITY = 'IDENTITY'
}

export interface BaseVaultItem {
  id?: string
  vaultId: string
  type: VaultItemType
  name: string
  favorite: boolean
  folder?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface AccountData {
  loginId: string
  password: string
  website: string
  totp?: string
}

export interface SecureNoteData {
  content: string
}

export interface CardData {
  cardholderName: string
  cardNumber: string
  brand: string
  expirationMonth: string
  expirationYear: string
  securityCode: string
}

export interface IdentityData {
  title?: string
  firstName: string
  middleName?: string
  lastName: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  company?: string
  email?: string
  phone?: string
}

export type VaultItemData = AccountData | SecureNoteData | CardData | IdentityData

export interface VaultItem extends BaseVaultItem {
  data: VaultItemData
}

export interface CreateVaultItemRequest {
  vaultId: string
  type: VaultItemType
  name: string
  data: VaultItemData
  favorite?: boolean
  folder?: string
  notes?: string
}

export interface CreateVaultItemResponse extends VaultItem {}

export interface UpdateVaultItemRequest {
  id: string
  name?: string
  data?: Partial<VaultItemData>
  favorite?: boolean
  folder?: string
  notes?: string
}

export interface VaultItemFormData {
  name: string
  favorite: boolean
  folder: string
  notes: string
  data: VaultItemData
} 