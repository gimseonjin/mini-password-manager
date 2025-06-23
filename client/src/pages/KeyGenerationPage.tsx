import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCachedUser } from '../services/AuthService'
import {
  generateAndSaveUserSecretKey,
  generateQRData,
  downloadPDFBackup,
} from '../services/SettingsService'
import { CheckIcon } from '../components/icons'
import QRCodeDisplay from '../components/QRCodeDisplay'

function KeyGenerationPage() {
  const navigate = useNavigate()
  const user = getCachedUser()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'generate' | 'success'>('generate')
  const [secretKey, setSecretKey] = useState<string>('')
  const [qrData, setQrData] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleGenerateNewKey = async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const newKey = generateAndSaveUserSecretKey(user.id)
      setSecretKey(newKey)
      
      // QR 코드 데이터 생성
      const qrCodeData = generateQRData(user.id, newKey)
      setQrData(qrCodeData)
      
      // PDF 백업 데이터 준비 및 다운로드
      if (user.email) {
        await handleDownloadBackup(user.id, user.email, newKey)
      }
      
      setStep('success')
    } catch (error) {
      console.error('키 생성 실패:', error)
      setError('키 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBackup = async (userId: string, userEmail: string, key: string) => {
    try {
      await downloadPDFBackup(userId, userEmail, key)
    } catch (error) {
      console.error('PDF 다운로드 실패:', error)
      // 키 설정 단계에서는 에러가 발생해도 계속 진행
    }
  }

  const handleContinue = () => {
    navigate('/')
  }

  const handleBack = () => {
    navigate('/key-setup')
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
                {step === 'generate' && (
                  <>
                    <div className="text-center mb-4">
                      <div className="mb-3 d-flex justify-content-center">
                        <div
                          className="p-3 rounded-circle"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          🔑
                        </div>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">새 암호화 키 생성</h2>
                      <p className="text-muted mb-4">
                        새로운 암호화 키를 생성하고 백업 파일을 다운로드합니다.
                      </p>
                    </div>

                    {error && (
                      <div className="alert alert-danger mb-4" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="alert alert-info mb-4">
                      <h6 className="fw-semibold mb-2">🛡️ 보안 안내</h6>
                      <ul className="small mb-0">
                        <li>암호화 키는 귀하의 기기에만 저장됩니다.</li>
                        <li>서버에는 암호화 키가 저장되지 않습니다.</li>
                        <li>키를 분실하면 암호화된 데이터를 복구할 수 없습니다.</li>
                        <li>백업 파일을 안전한 곳에 보관하세요.</li>
                      </ul>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary rounded-pill flex-grow-1"
                        onClick={handleBack}
                        disabled={loading}
                      >
                        뒤로가기
                      </button>
                      <button
                        className="btn btn-primary rounded-pill flex-grow-1"
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
                          '키 생성하기'
                        )}
                      </button>
                    </div>
                  </>
                )}

                {step === 'success' && (
                  <>
                    <div className="text-center mb-4">
                      <div className="mb-3 d-flex justify-content-center">
                        <div
                          className="p-3 rounded-circle"
                          style={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                          }}
                        >
                          <CheckIcon />
                        </div>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">키 생성 완료!</h2>
                      <p className="text-muted mb-4">
                        암호화 키가 성공적으로 생성되었습니다.
                      </p>
                    </div>

                    <div className="alert alert-success mb-4">
                      <h6 className="fw-semibold mb-2">✅ 완료된 작업</h6>
                      <ul className="small mb-0">
                        <li>암호화 키가 안전하게 생성되었습니다.</li>
                        <li>키가 이 기기에 저장되었습니다.</li>
                        {qrData && <li>백업 파일이 다운로드되었습니다.</li>}
                        <li>이제 비밀번호를 안전하게 저장할 수 있습니다.</li>
                      </ul>
                    </div>

                    {qrData && (
                      <div className="card bg-light mb-4">
                        <div className="card-body text-center">
                          <h6 className="fw-semibold mb-3">📱 QR 코드</h6>
                          <div className="d-flex justify-content-center mb-3">
                            <QRCodeDisplay data={qrData} size={200} />
                          </div>
                          <p className="text-muted small">
                            다른 기기에서 같은 키를 사용하려면 이 QR 코드를 스캔하세요.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-100 rounded-pill py-3"
                      onClick={handleContinue}
                    >
                      시작하기
                    </button>
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

export default KeyGenerationPage 