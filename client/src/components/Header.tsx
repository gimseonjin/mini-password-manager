import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCachedUser } from '../services/AuthService'
import { hasUserSecretKey } from '../services/SettingsService'

interface HeaderProps {
  title: string
  handleLogout: () => void
}

function Header({ title, handleLogout }: HeaderProps) {
  const user = getCachedUser()
  const location = useLocation()
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)

  const handleLogoutClick = () => {
    // 현재 사용자가 키를 가지고 있는지 확인
    if (user?.id && hasUserSecretKey(user.id)) {
      setShowLogoutWarning(true)
    } else {
      // 키가 없으면 바로 로그아웃
      handleLogout()
    }
  }

  const confirmLogout = () => {
    setShowLogoutWarning(false)
    handleLogout()
  }

  const cancelLogout = () => {
    setShowLogoutWarning(false)
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      <nav
        className="shadow-lg border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="me-3 p-2 rounded-circle bg-white bg-opacity-25">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="mb-0 h3 fw-bold text-white">{title}</h1>
            </div>

            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center px-3 py-2"
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '25px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="me-2"
                  >
                    <circle cx="12" cy="12" r="10" fill="#667eea" />
                    <circle cx="12" cy="10" r="3" fill="white" />
                    <path
                      d="M7 20.662V20a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v.662"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="text-white fw-medium"
                    style={{
                      fontSize: '0.9rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {user?.name || '사용자'}님
                  </span>
                </div>
                <button
                  className="btn text-white fw-medium px-4 py-2 rounded-pill transition-all"
                  onClick={handleLogoutClick}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 로그아웃 경고 모달 */}
      {showLogoutWarning && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">🚨 로그아웃 경고</h5>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                      color: '#fff'
                    }}
                  >
                    ⚠️
                  </div>
                  <h6 className="fw-semibold mb-3">정말 로그아웃하시겠습니까?</h6>
                </div>

                <div className="alert alert-warning border-0" style={{ background: '#fff3cd' }}>
                  <h6 className="fw-semibold text-warning mb-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    중요한 보안 알림
                  </h6>
                  <ul className="small mb-0 text-dark">
                    <li className="mb-1">
                      <strong>로그아웃 시 이 기기에서 암호화 키가 삭제됩니다</strong>
                    </li>
                    <li className="mb-1">
                      키를 백업하지 않았다면 <strong>저장된 모든 비밀번호에 접근할 수 없게 됩니다</strong>
                    </li>
                    <li className="mb-1">
                      다시 로그인해도 <strong>기존 데이터를 복구할 수 없습니다</strong>
                    </li>
                  </ul>
                </div>

                <div className="alert alert-info border-0 mb-0" style={{ background: '#d1ecf1' }}>
                  <h6 className="fw-semibold text-info mb-2">
                    💡 권장사항
                  </h6>
                  <p className="small mb-2 text-dark">
                    로그아웃하기 전에 <strong>설정 → QR 코드 보기</strong> 또는 
                    <strong> 백업 파일 다운로드</strong>를 통해 키를 안전하게 백업하세요.
                  </p>
                  <p className="small mb-0 text-dark">
                    백업이 있다면 언제든 다른 기기에서 동일한 키로 데이터에 접근할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={cancelLogout}
                >
                  취소 (백업하러 가기)
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={confirmLogout}
                >
                  그래도 로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
