// 인증 관련 타입 정의

export interface RegisterUserRequest {
  email: string
  name: string
  password: string
}

export interface LoginUserRequest {
  email: string
  password: string
}

export interface AccessToken {
  value: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  name: string
  email?: string
}

export interface RegisterUserResponse {
  id: string
  name: string
  accessToken: AccessToken
}

export interface LoginUserResponse {
  id: string
  name: string
  accessToken: AccessToken
}

export interface RefreshTokenResponse {
  accessToken: AccessToken
}

export interface ApiError {
  message: string
  status: number
}
