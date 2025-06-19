import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import {
  loadSecretKey,
  maskSecretKey,
  refreshSecretKey,
} from '../services/SettingsService'
import { RefreshIcon, EyeIcon, EyeSlashIcon, CheckIcon, ClipboardIcon } from '../components/icons'

function SettingsPage() {
  const navigate = useNavigate()
  const user = getCachedUser()
  const [secretKey, setSecretKey] = useState<string>('')
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false)
  const [showRefreshWarning, setShowRefreshWarning] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isLoggedIn()) {
      navigate('/login')
    }

    // 저장된 Secret key 불러오기
    const key = loadSecretKey()
    setSecretKey(key)
  }, [])

  const handleGoBack = () => {
    navigate('/')
  }

  const handleToggleSecretKey = () => {
    setShowSecretKey(!showSecretKey)
  }

  const handleCopySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // 2초 후 메시지 사라짐
    } catch (err) {
      console.error('복사 실패:', err)
      // fallback: 텍스트 선택 방식
      const textArea = document.createElement('textarea')
      textArea.value = secretKey
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleRefreshSecretKey = () => {
    setShowRefreshWarning(true)
  }

  const confirmRefreshSecretKey = () => {
    const newKey = refreshSecretKey()
    setSecretKey(newKey)
    setShowRefreshWarning(false)
    setShowSecretKey(false)
  }

  const cancelRefreshSecretKey = () => {
    setShowRefreshWarning(false)
  }

  return (
    <div className="page settings-page">
      <main className="main-content p-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h1 className="h3 fw-bold text-dark mb-0">⚙️ 설정</h1>
                  <button
                    className="btn btn-outline-secondary rounded-pill px-3"
                    onClick={handleGoBack}
                  >
                    ← 뒤로가기
                  </button>
                </div>

                <div className="border rounded-3 p-4 mb-3">
                  <h3 className="h5 fw-semibold mb-3">내 정보</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>이름:</strong> {user?.name || '사용자'}
                      </p>
                      <p className="mb-2">
                        <strong>이메일:</strong> {user?.email || '이메일 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-primary rounded-pill px-4 me-2">
                      정보 수정
                    </button>
                    <button className="btn btn-outline-danger rounded-pill px-4">
                      비밀번호 변경
                    </button>
                  </div>
                </div>

                <div className="border rounded-3 p-4">
                  <h3 className="h5 fw-semibold mb-3">🔐 Secret Key</h3>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <p className="text-muted mb-3">
                      암호화에 사용되는 비밀 키입니다. 이 키는 현재 브라우저에만
                      저장됩니다.
                    </p>

                    <button
                      className="btn btn-outline-warning rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                      onClick={handleRefreshSecretKey}
                      style={{
                        transition: 'all 0.3s ease',
                        borderWidth: '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 8px rgba(255, 193, 7, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow =
                          '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <RefreshIcon className="bi bi-arrow-clockwise" />
                      <span className="fw-semibold">새로 생성</span>
                    </button>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1">
                        <label className="form-label text-muted small mb-1">
                          Secret Key
                        </label>
                        <div className="font-monospace fw-bold">
                          {showSecretKey ? secretKey : maskSecretKey(secretKey)}
                        </div>
                      </div>
                      <div className="ms-3 d-flex gap-2">
                        <button
                          className="btn btn-outline-primary rounded-pill p-2 d-flex align-items-center justify-content-center"
                          onClick={handleToggleSecretKey}
                          style={{
                            width: '36px',
                            height: '36px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)'
                            e.currentTarget.style.backgroundColor = '#0d6efd'
                            e.currentTarget.style.borderColor = '#0d6efd'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                            e.currentTarget.style.borderColor = '#0d6efd'
                            e.currentTarget.style.color = '#0d6efd'
                          }}
                          title={showSecretKey ? '숨기기' : '보기'}
                        >
                          {showSecretKey ? (
                            <EyeSlashIcon className="bi bi-eye-slash-fill" />
                          ) : (
                            <EyeIcon className="bi bi-eye-fill" />
                          )}
                        </button>
                        <button
                          className={`btn rounded-pill p-2 d-flex align-items-center justify-content-center ${copySuccess ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={handleCopySecretKey}
                          style={{
                            width: '36px',
                            height: '36px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!copySuccess) {
                              e.currentTarget.style.transform = 'scale(1.1)'
                              e.currentTarget.style.backgroundColor = '#198754'
                              e.currentTarget.style.borderColor = '#198754'
                              e.currentTarget.style.color = 'white'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!copySuccess) {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.backgroundColor =
                                'transparent'
                              e.currentTarget.style.borderColor = '#198754'
                              e.currentTarget.style.color = '#198754'
                            }
                          }}
                          title="복사하기"
                        >
                          {copySuccess ? (
                            <CheckIcon className="bi bi-check2" />
                          ) : (
                            <ClipboardIcon className="bi bi-clipboard" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 경고 모달 */}
      {showRefreshWarning && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">⚠️ 경고</h5>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>Secret Key를 새로 생성하시겠습니까?</strong>
                </p>
                <div className="alert alert-warning">
                  <strong>주의사항:</strong>
                  <ul className="mb-0 mt-2">
                    <li>
                      기존에 암호화된 모든 비밀번호를 복호화할 수 없게 됩니다
                    </li>
                    <li>
                      저장된 비밀번호 데이터가 영구적으로 손실될 수 있습니다
                    </li>
                    <li>이 작업은 되돌릴 수 없습니다</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelRefreshSecretKey}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmRefreshSecretKey}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
