import {
  RegisterUserRequest,
  LoginUserRequest,
  RegisterUserResponse,
  LoginUserResponse,
  RefreshTokenResponse,
  AuthUser,
} from '../types/auth'
import {
  httpRequest,
  ApiRequestError,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from './httpClient'
import { removeUserSecretKey, performLoginKeyCleanup } from './SettingsService'

// 유저 정보 캐시 키
const USER_CACHE_KEY = 'user_cache'
const USER_CACHE_EXPIRY_KEY = 'user_cache_expiry'

export function getCachedUser(): AuthUser | null {
  try {
    const cachedUser = localStorage.getItem(USER_CACHE_KEY)
    const expiryTime = localStorage.getItem(USER_CACHE_EXPIRY_KEY)

    if (!cachedUser || !expiryTime) {
      return null
    }

    if (Date.now() > parseInt(expiryTime)) {
      removeCachedUser()
      return null
    }

    const user = JSON.parse(cachedUser)
    return user
  } catch (error) {
    removeCachedUser()
    return null
  }
}

export function setCachedUser(user: AuthUser): void {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    localStorage.setItem(
      USER_CACHE_EXPIRY_KEY,
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    )
  } catch (error) {
    console.error('Error caching user:', error)
  }
}

export function removeCachedUser(): void {
  localStorage.removeItem(USER_CACHE_KEY)
  localStorage.removeItem(USER_CACHE_EXPIRY_KEY)
}

export function clearAllTokens(): void {
  removeAccessToken()
  removeCachedUser()
}

// 인증 API 함수들
export async function registerUser(
  userData: RegisterUserRequest
): Promise<RegisterUserResponse> {
  try {
    const response = await httpRequest<RegisterUserResponse>(
      '/api/v1/user/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    )

    // 토큰 저장
    setAccessToken(response.accessToken.value)

    // 서버에서 최신 유저 정보 가져와서 캐시에 저장
    try {
      const userInfo = await getCurrentUser()
      setCachedUser(userInfo)
      
      // 회원가입 시에도 키 정리 수행 (기존 레거시 키 등 정리)
      if (userInfo.id) {
        performLoginKeyCleanup(userInfo.id)
      }
    } catch (userError) {
      console.error('Failed to fetch user info after registration:', userError)
      // 유저 정보 가져오기 실패해도 회원가입은 성공으로 처리
    }

    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 409) {
        throw new Error('이미 존재하는 사용자입니다.')
      }
    }
    throw error
  }
}

export async function loginUser(
  credentials: LoginUserRequest
): Promise<LoginUserResponse> {
  try {
    const response = await httpRequest<LoginUserResponse>(
      '/api/v1/user/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    )

    // 토큰 저장
    setAccessToken(response.accessToken.value)

    // 서버에서 최신 유저 정보 가져와서 캐시에 저장
    try {
      const userInfo = await getCurrentUser()
      setCachedUser(userInfo)
      
      // 로그인 성공 시 키 정리 수행
      if (userInfo.id) {
        performLoginKeyCleanup(userInfo.id)
      }
    } catch (userError) {
      console.error('Failed to fetch user info after login:', userError)
      // 유저 정보 가져오기 실패해도 로그인은 성공으로 처리
    }

    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    }
    throw error
  }
}

export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await httpRequest<RefreshTokenResponse>(
      '/api/v1/user/refresh',
      {
        method: 'POST',
      }
    )

    // 새로운 토큰 저장
    setAccessToken(response.accessToken.value)

    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        // 리프레시 토큰이 만료된 경우 모든 토큰 제거
        clearAllTokens()
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.')
      }
    }
    throw error
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const response = await httpRequest<AuthUser>('/api/v1/user/me')

    // 응답을 캐시에 저장
    setCachedUser(response)

    return response
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) {
        // 토큰이 만료된 경우 리프레시 시도
        try {
          await refreshAccessToken()
          const response = await httpRequest<AuthUser>('/api/v1/user/me')

          // 응답을 캐시에 저장
          setCachedUser(response)

          return response
        } catch (refreshError) {
          clearAllTokens()
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
      }
    }
    throw error
  }
}

export function logout(): void {
  // 현재 사용자 정보 가져오기
  const cachedUser = getCachedUser()
  
  // 사용자별 secretkey 삭제
  if (cachedUser?.id) {
    removeUserSecretKey(cachedUser.id)
  }
  
  // 토큰 및 캐시 삭제
  clearAllTokens()
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}
