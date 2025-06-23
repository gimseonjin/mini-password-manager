import { useState, useEffect } from 'react'
import { isLoggedIn, getCachedUser, getCurrentUser, clearAllTokens } from '../services/AuthService'
import { AuthUser } from '../types/auth'

// localStorage 변화를 감지하는 간단한 훅
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(getCachedUser())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // 로딩 상태 추가

  // 앱 시작 시 서버에서 유저 정보 검증
  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        if (isLoggedIn()) {
          // 토큰이 있으면 서버에서 유저 정보 확인
          const serverUser = await getCurrentUser()
          setUser(serverUser)
          setIsAuthenticated(true)
        } else {
          // 토큰이 없으면 로그아웃 상태
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Authentication verification failed:', error)
        // 서버 검증 실패 시 모든 토큰 제거하고 로그아웃 처리
        clearAllTokens()
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuthentication()
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const newUser = getCachedUser()
      const newIsAuthenticated = isLoggedIn()

      setUser(newUser)
      setIsAuthenticated(newIsAuthenticated)
    }

    const handleAuthChange = () => {
      handleStorageChange()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  return { user, isAuthenticated, isLoading }
}

// 인증 상태 변화를 알리는 헬퍼 함수
export function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent('auth-change'))
}
