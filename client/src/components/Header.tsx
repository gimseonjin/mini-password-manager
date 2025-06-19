import { getCachedUser } from '../services/AuthService'

interface HeaderProps {
  title: string
  handleLogout: () => void
}

function Header({ title, handleLogout }: HeaderProps) {
  const user = getCachedUser()

  return (
    <nav
      className="shadow-lg border-0"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container-fluid px-4 d-flex justify-content-between align-items-center py-3">
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
              onClick={handleLogout}
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
    </nav>
  )
}

export default Header
