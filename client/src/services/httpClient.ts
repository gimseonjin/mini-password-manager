// 공용 HTTP 클라이언트
// 프로젝트 전체에서 사용하는 HTTP 요청 함수들

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// 토큰 스토리지 키
const ACCESS_TOKEN_KEY = 'access_token'

// API 에러 클래스
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

// 토큰 관련 유틸 함수들
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// 공용 HTTP 요청 함수
export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 인증이 필요한 엔드포인트에 토큰 추가
  const token = getAccessToken()
  if (
    token &&
    !endpoint.includes('/login') &&
    !endpoint.includes('/register')
  ) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      throw new ApiRequestError(response.status, errorMessage)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error
    }

    throw new ApiRequestError(0, '네트워크 오류가 발생했습니다.')
  }
}


