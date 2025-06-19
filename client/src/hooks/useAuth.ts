import { useState, useEffect } from 'react'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import { AuthUser } from '../types/auth'

// localStorage 변화를 감지하는 간단한 훅
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(getCachedUser())
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn())

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

  return { user, isAuthenticated }
}

// 인증 상태 변화를 알리는 헬퍼 함수
export function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent('auth-change'))
}
