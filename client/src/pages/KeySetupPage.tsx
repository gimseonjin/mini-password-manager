import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import {
  hasUserSecretKey,
  saveUserSecretKey,
  parseQRData,
} from '../services/SettingsService'
import { ShieldIcon } from '../components/icons'

function KeySetupPage() {
  const navigate = useNavigate()
  const user = getCachedUser()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'check' | 'setup' | 'import'>('check')
  const [importInput, setImportInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isLoggedIn() || !user?.id) {
      navigate('/login')
      return
    }

    // 최초 한 번만 체크 - 이미 키가 있으면 홈으로, 없으면 설정 모드로
    if (step === 'check') {
      if (hasUserSecretKey(user.id)) {
        navigate('/')
      } else {
        setStep('setup')
      }
    }
    // 키 설정이 시작된 이후에는 절대 자동 리다이렉트하지 않음
  }, [user?.id, navigate]) // step 의존성 제거하여 재실행 방지

  const handleGenerateNewKey = () => {
    navigate('/key-generation')
  }

  const handleImportKey = () => {
    setStep('import')
  }

  const handleConfirmImport = () => {
    if (!user?.id || !importInput.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const parsedData = parseQRData(importInput.trim())
      if (parsedData && parsedData.userId === user.id) {
        saveUserSecretKey(user.id, parsedData.secretKey)
        // 키 가져오기 성공 시 홈으로 이동
        navigate('/')
      } else {
        setError('올바르지 않은 백업 데이터이거나 다른 사용자의 키입니다.')
      }
    } catch (error) {
      console.error('키 가져오기 실패:', error)
      setError('키 가져오기 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSetup = () => {
    setStep('setup')
    setImportInput('')
    setError(null)
  }

  if (step === 'check') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">키 설정 상태를 확인하는 중...</p>
        </div>
      </div>
    )
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
          <div className="col-md-8 col-lg-6">
            <div
              className="card shadow-lg border-0 rounded-4"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="card-body p-5">
                {step === 'setup' && (
                  <>
                    <div className="text-center mb-4">
                      <div className="mb-3 d-flex justify-content-center">
                        <div
                          className="p-3 rounded-circle"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          <ShieldIcon />
                        </div>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">암호화 키 설정</h2>
                      <p className="text-muted mb-4">
                        비밀번호를 안전하게 암호화하기 위한 키가 필요합니다.
                      </p>
                    </div>

                    {error && (
                      <div className="alert alert-danger mb-4" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12">
                        <div className="card border-primary h-100">
                          <div className="card-body text-center p-4">
                            <div className="mb-3">
                              <div
                                className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  background: '#e3f2fd',
                                  color: '#1976d2'
                                }}
                              >
                                🔑
                              </div>
                              <h5 className="fw-semibold">새 키 생성</h5>
                              <p className="text-muted small mb-3">
                                새로운 암호화 키를 생성하고 백업 파일을 다운로드합니다.
                              </p>
                            </div>
                            <button
                              className="btn btn-primary w-100 rounded-pill"
                              onClick={handleGenerateNewKey}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  생성 중...
                                </>
                              ) : (
                                '새 키 생성하기'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="text-center">
                          <span className="text-muted">또는</span>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="card border-secondary h-100">
                          <div className="card-body text-center p-4">
                            <div className="mb-3">
                              <div
                                className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  background: '#f3e5f5',
                                  color: '#7b1fa2'
                                }}
                              >
                                📱
                              </div>
                              <h5 className="fw-semibold">기존 키 가져오기</h5>
                              <p className="text-muted small mb-3">
                                다른 기기에서 사용하던 키를 가져옵니다.
                              </p>
                            </div>
                            <button
                              className="btn btn-outline-secondary w-100 rounded-pill"
                              onClick={handleImportKey}
                              disabled={loading}
                            >
                              기존 키 가져오기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info mt-4">
                      <h6 className="fw-semibold mb-2">🛡️ 보안 안내</h6>
                      <ul className="small mb-0">
                        <li>암호화 키는 귀하의 기기에만 저장됩니다.</li>
                        <li>서버에는 암호화 키가 저장되지 않습니다.</li>
                        <li>키를 분실하면 암호화된 데이터를 복구할 수 없습니다.</li>
                        <li>백업 파일을 안전한 곳에 보관하세요.</li>
                      </ul>
                    </div>
                  </>
                )}

                {step === 'import' && (
                  <>
                    <div className="text-center mb-4">
                      <div className="mb-3 d-flex justify-content-center">
                        <div
                          className="p-3 rounded-circle"
                          style={{
                            background: 'linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)',
                          }}
                        >
                          📱
                        </div>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">키 가져오기</h2>
                      <p className="text-muted mb-4">
                        백업 파일이나 QR 코드의 데이터를 입력하세요.
                      </p>
                    </div>

                    {error && (
                      <div className="alert alert-danger mb-4" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-medium">백업 데이터 입력</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={6}
                        value={importInput}
                        onChange={(e) => setImportInput(e.target.value)}
                        placeholder="백업 파일의 QR 코드 데이터나 전체 내용을 붙여넣으세요..."
                        disabled={loading}
                      />
                      <div className="form-text">
                        백업 파일을 열어서 내용을 복사하거나, QR 코드를 스캔한 데이터를 붙여넣으세요.
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary rounded-pill flex-grow-1"
                        onClick={handleBackToSetup}
                        disabled={loading}
                      >
                        뒤로가기
                      </button>
                      <button
                        className="btn btn-primary rounded-pill flex-grow-1"
                        onClick={handleConfirmImport}
                        disabled={loading || !importInput.trim()}
                      >
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            가져오는 중...
                          </>
                        ) : (
                          '키 가져오기'
                        )}
                      </button>
                    </div>
                  </>
                )}


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeySetupPage 