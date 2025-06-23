import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import {
  loadUserSecretKey,
  maskSecretKey,
  generateAndSaveUserSecretKey,
  hasUserSecretKey,
  saveUserSecretKey,
  generateQRData,
  generatePDFBackupData,
  downloadPDFBackup,
  parseQRData,
} from '../services/SettingsService'
import { RefreshIcon, EyeIcon, EyeSlashIcon, CheckIcon, ClipboardIcon } from '../components/icons'
import QRCodeDisplay from '../components/QRCodeDisplay'

function SettingsPage() {
  const navigate = useNavigate()
  const user = getCachedUser()
  const [secretKey, setSecretKey] = useState<string>('')
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false)
  const [showRefreshWarning, setShowRefreshWarning] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [showQRModal, setShowQRModal] = useState<boolean>(false)
  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [qrData, setQrData] = useState<string>('')
  const [importQrInput, setImportQrInput] = useState<string>('')
  const [hasKey, setHasKey] = useState<boolean>(false)
  const [showKeyStatus, setShowKeyStatus] = useState<boolean>(false)
  const [keyStatus, setKeyStatus] = useState<any>(null)

  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isLoggedIn() || !user?.id) {
      navigate('/login')
      return
    }

    // 사용자별 Secret key 확인 및 로드
    const keyExists = hasUserSecretKey(user.id)
    setHasKey(keyExists)
    
    if (keyExists) {
      const key = loadUserSecretKey(user.id)
      if (key) {
        setSecretKey(key)
      }
    }
  }, [user?.id, navigate])

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
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
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
    if (!user?.id) return
    
    const newKey = generateAndSaveUserSecretKey(user.id)
    setSecretKey(newKey)
    setHasKey(true)
    setShowRefreshWarning(false)
    setShowSecretKey(false)
  }

  const cancelRefreshSecretKey = () => {
    setShowRefreshWarning(false)
  }

  const handleGenerateNewKey = () => {
    if (!user?.id) return
    
    const newKey = generateAndSaveUserSecretKey(user.id)
    setSecretKey(newKey)
    setHasKey(true)
  }

  const handleShowQR = () => {
    if (!user?.id || !secretKey) return
    
    const qrCodeData = generateQRData(user.id, secretKey)
    setQrData(qrCodeData)
    setShowQRModal(true)
  }

  const handleDownloadPDF = async () => {
    if (!user?.id || !user?.email || !secretKey) return
    
    try {
      await downloadPDFBackup(user.id, user.email, secretKey)
    } catch (error) {
      console.error('PDF 다운로드 실패:', error)
      alert('PDF 백업 파일 생성 중 오류가 발생했습니다.')
    }
  }

  const handleImportKey = () => {
    setShowImportModal(true)
  }

  const handleConfirmImport = () => {
    if (!user?.id || !importQrInput.trim()) return
    
    const parsedData = parseQRData(importQrInput.trim())
    if (parsedData && parsedData.userId === user.id) {
      saveUserSecretKey(user.id, parsedData.secretKey)
      setSecretKey(parsedData.secretKey)
      setHasKey(true)
      setShowImportModal(false)
      setImportQrInput('')
      alert('키를 성공적으로 가져왔습니다!')
    } else {
      alert('올바르지 않은 QR 데이터이거나 다른 사용자의 키입니다.')
    }
  }

  const handleCancelImport = () => {
    setShowImportModal(false)
    setImportQrInput('')
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

                  {!hasKey ? (
                    <div className="text-center py-4">
                      <div className="mb-3">
                        <div
                          className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#6c757d'
                          }}
                        >
                          🔑
                        </div>
                        <h4 className="h6 fw-semibold">암호화 키가 설정되지 않았습니다</h4>
                        <p className="text-muted mb-4">
                          비밀번호를 안전하게 암호화하려면 키를 설정해야 합니다.
                        </p>
                      </div>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-primary rounded-pill px-4"
                          onClick={handleGenerateNewKey}
                        >
                          새 키 생성
                        </button>
                        <button
                          className="btn btn-outline-primary rounded-pill px-4"
                          onClick={handleImportKey}
                        >
                          기존 키 가져오기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <p className="text-muted mb-0">
                          암호화에 사용되는 비밀 키입니다. 이 키는 귀하의 계정에만 저장됩니다.
                        </p>

                        <button
                          className="btn btn-outline-warning rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                          onClick={handleRefreshSecretKey}
                          style={{
                            transition: 'all 0.3s ease',
                            borderWidth: '2px',
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
                              style={{ width: '36px', height: '36px' }}
                              title={showSecretKey ? '숨기기' : '보기'}
                            >
                              {showSecretKey ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                            <button
                              className={`btn rounded-pill p-2 d-flex align-items-center justify-content-center ${copySuccess ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={handleCopySecretKey}
                              style={{ width: '36px', height: '36px' }}
                              title="복사하기"
                            >
                              {copySuccess ? <CheckIcon /> : <ClipboardIcon />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-info rounded-pill px-4"
                          onClick={handleShowQR}
                        >
                          📱 QR 코드 보기
                        </button>
                        <button
                          className="btn btn-secondary rounded-pill px-4"
                          onClick={handleDownloadPDF}
                        >
                          📄 백업 파일 다운로드
                        </button>
                        <button
                          className="btn btn-outline-primary rounded-pill px-4"
                          onClick={handleImportKey}
                        >
                          🔄 키 가져오기
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR 코드 모달 */}
      {showQRModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📱 QR 코드</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQRModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3 d-flex justify-content-center">
                  <QRCodeDisplay data={qrData} size={250} />
                </div>
                <p className="text-muted small">
                  이 QR 코드를 다른 기기에서 스캔하여 동일한 암호화 키를 설정할 수 있습니다.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQRModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 키 가져오기 모달 */}
      {showImportModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">🔄 키 가져오기</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelImport}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">QR 코드 데이터 또는 백업 정보를 입력하세요:</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={importQrInput}
                    onChange={(e) => setImportQrInput(e.target.value)}
                    placeholder="QR 코드 데이터 또는 백업 파일의 내용을 붙여넣으세요..."
                  />
                </div>
                <div className="alert alert-info">
                  <small>
                    📱 QR 코드를 스캔했거나 백업 파일의 데이터가 있다면 여기에 붙여넣으세요.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelImport}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmImport}
                  disabled={!importQrInput.trim()}
                >
                  키 가져오기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 키 새로 생성 경고 모달 */}
      {showRefreshWarning && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                    <li>기존에 암호화된 모든 비밀번호를 복호화할 수 없게 됩니다</li>
                    <li>저장된 비밀번호 데이터가 영구적으로 손실될 수 있습니다</li>
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

      {/* 키 상태 모달 */}
      {showKeyStatus && keyStatus && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📊 로컬 스토리지 키 상태</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowKeyStatus(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="fw-semibold">전체 키 개수</h6>
                        <div className="display-6 fw-bold text-primary">{keyStatus.totalKeys}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="fw-semibold">레거시 키</h6>
                        <div className="display-6 fw-bold text-warning">
                          {keyStatus.hasLegacyKey ? '1' : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body text-center">
                        <h6 className="fw-semibold">사용자 키</h6>
                        <div className="display-6 fw-bold text-success">{keyStatus.userKeys.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {keyStatus.hasLegacyKey && (
                  <div className="alert alert-warning mt-3">
                    <h6 className="fw-semibold">⚠️ 레거시 키 발견</h6>
                    <p className="mb-0 small">
                      이전 버전에서 사용하던 전역 키가 발견되었습니다. 
                      이 키는 다음 로그인 시 자동으로 삭제됩니다.
                    </p>
                  </div>
                )}

                {keyStatus.userKeys.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-semibold">사용자별 키 목록</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>사용자 ID</th>
                            <th>마스킹된 키</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keyStatus.userKeys.map((userKey: any, index: number) => (
                            <tr key={index}>
                              <td>
                                <code className="small">{userKey.userId}</code>
                              </td>
                              <td>
                                <code className="small text-muted">{userKey.maskedKey}</code>
                              </td>
                              <td>
                                {userKey.userId === user?.id ? (
                                  <span className="badge bg-success">현재 사용자</span>
                                ) : (
                                  <span className="badge bg-secondary">다른 사용자</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="alert alert-info mt-3">
                  <h6 className="fw-semibold">💡 자동 정리 안내</h6>
                  <ul className="small mb-0">
                    <li>로그인 시 레거시 키와 다른 사용자의 키는 자동으로 삭제됩니다</li>
                    <li>현재 사용자의 키만 유지되어 보안과 성능이 향상됩니다</li>
                    <li>필요시 "모든 키 삭제" 버튼으로 수동 정리도 가능합니다</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowKeyStatus(false)}
                >
                  닫기
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
