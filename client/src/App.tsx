import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Header from './components/Header'
import { logout, clearAllTokens } from './services/AuthService'
import { useAuthState } from './hooks/useAuth'
import SettingsPage from './pages/SettingsPage'

// 로그인 상태 확인 및 보호된 라우트 컴포넌트
function ProtectedRoutes() {
  const { isAuthenticated } = useAuthState()

  const handleLogout = () => {
    logout()
    clearAllTokens()
    // 페이지 새로고침으로 상태 초기화
    window.location.href = '/login'
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // 로그인한 경우 Header와 함께 정상적인 라우팅
  return (
    <div className="app">
      <Header title="미니 패스워드 매니저" handleLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
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
