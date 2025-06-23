import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import KeySetupPage from './pages/KeySetupPage'
import KeyGenerationPage from './pages/KeyGenerationPage'
import Header from './components/Header'
import { logout, getCachedUser } from './services/AuthService'
import { hasUserSecretKey } from './services/SettingsService'
import { useAuthState } from './hooks/useAuth'
import SettingsPage from './pages/SettingsPage'

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>인증 확인 중...</p>
    </div>
  )
}

// 로그인 상태 확인 및 보호된 라우트 컴포넌트
function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuthState()
  const user = getCachedUser()
  const location = useLocation()
  const [userHasKey, setUserHasKey] = useState<boolean>(false)
  const [keyCheckLoading, setKeyCheckLoading] = useState<boolean>(true)

  // 키 설정 과정 중인지 확인하는 함수
  const isInKeySetupProcess = () => {
    return location.pathname === '/key-setup' || location.pathname === '/key-generation'
  }

  // 키 존재 여부를 확인 (키 설정 과정 중이 아닐 때만)
  useEffect(() => {
    if (user?.id) {
      const checkUserKey = () => {
        const hasKey = hasUserSecretKey(user.id)
        setUserHasKey(hasKey)
        setKeyCheckLoading(false)
      }
      
      checkUserKey()
      
      // 키 설정 과정 중이 아닐 때만 주기적으로 체크
      if (!isInKeySetupProcess()) {
        const interval = setInterval(checkUserKey, 1000)
        return () => clearInterval(interval)
      }
    } else {
      setKeyCheckLoading(false)
    }
  }, [user?.id, location.pathname])

  const handleLogout = () => {
    // logout() 함수에서 이미 clearAllTokens()가 호출됨
    logout()
    // 페이지 새로고침으로 상태 초기화
    window.location.href = '/login'
  }

  // 로딩 중일 때는 스피너 표시
  if (isLoading || keyCheckLoading) {
    return <LoadingSpinner />
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // 로그인했지만 키가 설정되지 않은 경우 키 설정 페이지로 리다이렉트
  if (user?.id && !userHasKey) {
    return (
      <Routes>
        <Route path="/key-setup" element={<KeySetupPage />} />
        <Route path="/key-generation" element={<KeyGenerationPage />} />
        <Route path="*" element={<Navigate to="/key-setup" replace />} />
      </Routes>
    )
  }

  // 로그인하고 키도 설정된 경우 Header와 함께 정상적인 라우팅
  return (
    <div className="app">
      <Header title="미니 패스워드 매니저" handleLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/key-setup" element={<Navigate to="/" replace />} />
        <Route path="/key-generation" element={<Navigate to="/" replace />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ProtectedRoutes />
    </Router>
  )
}

export default App
