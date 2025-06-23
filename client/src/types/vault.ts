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