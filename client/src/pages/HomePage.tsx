import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import { SettingsIcon } from '../components/icons'

function HomePage() {
  const navigate = useNavigate()
  const user = getCachedUser()

  useEffect(() => {
    console.log('isLoggedIn', isLoggedIn())
    
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, [])

  const handleGoToSettings = () => {
    navigate('/settings')
  }

  return (
    <div className="page home-page">
      <main className="main-content p-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h1 className="h3 fw-bold text-dark mb-3">
                      환영합니다, {user?.name || '사용자'}님! 👋
                    </h1>
                    <p className="text-muted mb-4">
                      미니 패스워드 매니저에서 안전하게 비밀번호를 관리하세요.
                    </p>
                  </div>
                  <button
                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                    onClick={handleGoToSettings}
                    style={{ width: '40px', height: '40px' }}
                    title="설정"
                  >
                    <SettingsIcon width={20} height={20} />
                  </button>
                </div>
                <div className="d-flex gap-3">
                  <button className="btn btn-primary rounded-pill px-4">
                    새 비밀번호 추가
                  </button>
                  <button className="btn btn-outline-secondary rounded-pill px-4">
                    내 비밀번호 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
