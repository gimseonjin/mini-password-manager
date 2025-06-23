import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loginUser,
  registerUser,
  isLoggedIn,
} from '../services/AuthService'
import { notifyAuthChange } from '../hooks/useAuth'
import { RegisterUserRequest, LoginUserRequest } from '../types/auth'
import { ShieldIcon, ErrorIcon } from '../components/icons'

function LoginPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // 이미 로그인된 사용자는 홈페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/')
    }
  }, [isLogin, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 에러 초기화
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인 로직
        const credentials: LoginUserRequest = {
          email: formData.email,
          password: formData.password,
        }

        await loginUser(credentials)

        // 인증 상태 변화 알림
        notifyAuthChange()

        // 로그인 성공 후 홈페이지로 리다이렉트
        navigate('/')
      } else {
        // 회원가입 로직
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.')
          return
        }

        if (formData.password.length < 8) {
          setError('비밀번호는 8자 이상이어야 합니다.')
          return
        }

        const userData: RegisterUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }

        await registerUser(userData)

        // 인증 상태 변화 알림
        notifyAuthChange()

        // 회원가입 성공 후 홈페이지로 리다이렉트
        navigate('/')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError(
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div
              className="card shadow-lg border-0 rounded-4"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="card-body p-5">
                {/* 헤더 */}
                <div className="text-center mb-4">
                  <div className="mb-3 d-flex justify-content-center">
                    <div
                      className="p-3 rounded-circle"
                      style={{
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <ShieldIcon />
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">
                    미니 패스워드 매니저
                  </h2>
                  <p className="text-muted mb-4">
                    {isLogin
                      ? '안전한 로그인으로 시작하세요'
                      : '새 계정을 만들어보세요'}
                  </p>
                </div>

                {/* 탭 */}
                <div
                  className="d-flex mb-4 p-1 rounded-pill"
                  style={{ background: '#f8f9fa' }}
                >
                  <button
                    className={`btn flex-fill rounded-pill fw-medium ${isLogin ? 'text-white' : 'text-muted'}`}
                    style={{
                      background: isLogin
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'transparent',
                      border: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setIsLogin(true)}
                  >
                    로그인
                  </button>
                  <button
                    className={`btn flex-fill rounded-pill fw-medium ${!isLogin ? 'text-white' : 'text-muted'}`}
                    style={{
                      background: !isLogin
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'transparent',
                      border: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setIsLogin(false)}
                  >
                    회원가입
                  </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center mb-4"
                    role="alert"
                  >
                    <ErrorIcon className="me-2" />
                    <div>{error}</div>
                  </div>
                )}

                {/* 폼 */}
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        이름
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control rounded-3 border-0 shadow-sm py-3"
                        style={{ background: '#f8f9fa' }}
                        placeholder="이름을 입력하세요"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control rounded-3 border-0 shadow-sm py-3"
                      style={{ background: '#f8f9fa' }}
                      placeholder="이메일을 입력하세요"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">
                      비밀번호
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control rounded-3 border-0 shadow-sm py-3"
                      style={{ background: '#f8f9fa' }}
                      placeholder={
                        !isLogin
                          ? '비밀번호(8자 이상)를 입력하세요'
                          : '비밀번호를 입력하세요'
                      }
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="mb-4">
                      <label className="form-label fw-medium text-dark">
                        비밀번호 확인
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control rounded-3 border-0 shadow-sm py-3"
                        style={{ background: '#f8f9fa' }}
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn w-100 text-white fw-medium py-3 rounded-3 shadow-sm"
                    style={{
                      background: loading
                        ? '#6c757d'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    disabled={loading}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow =
                          '0 8px 25px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 15px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        처리중...
                      </div>
                    ) : isLogin ? (
                      '로그인'
                    ) : (
                      '회원가입'
                    )}
                  </button>
                </form>

                {isLogin && (
                  <div className="text-center mt-4">
                    <small className="text-muted">
                      비밀번호를 잊으셨나요?
                      <a
                        href="#"
                        className="text-decoration-none fw-medium"
                        style={{ color: '#667eea' }}
                      >
                        재설정하기
                      </a>
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
