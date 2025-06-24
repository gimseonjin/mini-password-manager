import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import { createVault, getVaults, deleteVault } from '../services/VaultService'
import { CreateVaultRequest, AddVaultItemResponseDto, FetchVaultsResponse } from '../types/vault'
import { SettingsIcon, ShieldIcon } from '../components/icons'
import AddAccountForm from '../components/AddVaultItemForm'
import { loadUserSecretKey } from '../services/SettingsService'

function HomePage() {
  const navigate = useNavigate()
  const user = getCachedUser()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [vaultName, setVaultName] = useState('')
  const [vaultDescription, setVaultDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [vaults, setVaults] = useState<FetchVaultsResponse[]>([])
  const [isLoadingVaults, setIsLoadingVaults] = useState(true)
  const [vaultsError, setVaultsError] = useState('')
  const [selectedVault, setSelectedVault] = useState<FetchVaultsResponse | null>(null)
  const [showVaultMenu, setShowVaultMenu] = useState<string | null>(null)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [secretKey, setSecretKey] = useState<string>('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
    } else {
      loadVaults()
      // 사용자 secretKey 로드
      if (user?.id) {
        const userSecretKey = loadUserSecretKey(user.id)
        if (userSecretKey) {
          setSecretKey(userSecretKey)
        }
      }
    }
  }, [])

  const loadVaults = async () => {
    try {
      setIsLoadingVaults(true)
      setVaultsError('')
      const vaultList = await getVaults()
      setVaults(vaultList)
      // 선택된 볼트가 없거나 삭제된 경우 첫 번째 볼트 선택
      if (!selectedVault && vaultList.length > 0) {
        setSelectedVault(vaultList[0])
      } else if (selectedVault && !vaultList.find(v => v.id === selectedVault.id)) {
        setSelectedVault(vaultList.length > 0 ? vaultList[0] : null)
      }
    } catch (error) {
      if (error instanceof Error) {
        setVaultsError(error.message)
      } else {
        setVaultsError('Vault 목록을 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoadingVaults(false)
    }
  }

  const handleGoToSettings = () => {
    navigate('/settings')
  }

  const handleCreateVault = async () => {
    if (!vaultName.trim()) {
      setCreateError('Vault 이름을 입력해주세요.')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const vaultData: CreateVaultRequest = {
        vaultName: vaultName.trim(),
        description: vaultDescription.trim() || undefined,
      }

      const newVault = await createVault(vaultData)
      
      // 성공 시 모달 닫기 및 폼 초기화
      setShowCreateModal(false)
      setVaultName('')
      setVaultDescription('')
      
      // Vault 목록 새로고침
      await loadVaults()
      
      // 새로 생성된 볼트 선택
      setSelectedVault(newVault)
      
    } catch (error) {
      if (error instanceof Error) {
        setCreateError(error.message)
      } else {
        setCreateError('Vault 생성 중 오류가 발생했습니다.')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleModalClose = () => {
    if (!isCreating) {
      setShowCreateModal(false)
      setVaultName('')
      setVaultDescription('')
      setCreateError('')
    }
  }

  const handleDeleteVault = async (vaultId: string, vaultName: string) => {
    if (!confirm(`"${vaultName}" Vault를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      await deleteVault(vaultId)
      await loadVaults()
      setShowVaultMenu(null)
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Vault 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleVaultSelect = (vault: FetchVaultsResponse) => {
    setSelectedVault(vault)
    setShowVaultMenu(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const toggleVaultMenu = (vaultId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setShowVaultMenu(showVaultMenu === vaultId ? null : vaultId)
  }

  const handleAddItem = () => {
    if (!selectedVault) {
      alert('먼저 Vault를 선택해주세요.')
      return
    }
    
    // secretKey가 없으면 설정 페이지로 이동
    if (!secretKey) {
      alert('시크릿 키가 설정되지 않았습니다. 설정 페이지에서 키를 생성해주세요.')
      navigate('/settings')
      return
    }
    
    setShowAddItemForm(true)
  }

  const handleCancelAddItem = () => {
    setShowAddItemForm(false)
  }

  const handleSubmitItem = async (response: AddVaultItemResponseDto) => {
    try {
      console.log('아이템 생성 완료:', response)
      alert('계정이 성공적으로 추가되었습니다!')
      setShowAddItemForm(false)
      
      // TODO: vault item 목록 새로고침 구현 예정
      
    } catch (error) {
      if (error instanceof Error) {
        alert(`오류: ${error.message}`)
      } else {
        alert('계정 추가 중 오류가 발생했습니다.')
      }
    }
  }

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setShowVaultMenu(null)
    }
    
    if (showVaultMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showVaultMenu])

  return (
    <div className="page home-page">
      <main className="main-content p-4">
        <div className="container-fluid">
          {/* 헤더 */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="bg-white rounded-4 shadow-sm p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h1 className="h3 fw-bold text-dark mb-1">
                      환영합니다, {user?.name || '사용자'}님! 👋
                    </h1>
                    <p className="text-muted mb-0">
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
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="row">
            {/* 왼쪽: Vault 리스트 */}
            <div className="col-md-4 col-lg-3">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h2 className="h5 fw-semibold text-dark mb-0 d-flex align-items-center">
                    <ShieldIcon width={20} height={20} className="me-2" />
                    Vault 목록
                  </h2>
                  <button
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={() => setShowCreateModal(true)}
                  >
                    + 새 Vault
                  </button>
                </div>

                {vaultsError && (
                  <div className="alert alert-danger alert-sm" role="alert">
                    {vaultsError}
                  </div>
                )}

                {isLoadingVaults ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">로딩 중...</span>
                    </div>
                    <p className="mt-2 text-muted small">Vault 목록을 불러오는 중...</p>
                  </div>
                ) : vaults.length === 0 ? (
                  <div className="text-center py-4">
                    <ShieldIcon width={32} height={32} className="text-muted mb-2" />
                    <p className="text-muted small mb-2">아직 생성된 Vault가 없습니다</p>
                    <p className="text-muted small">첫 번째 Vault를 생성해보세요!</p>
                  </div>
                ) : (
                  <div className="vault-list">
                    {vaults.map((vault) => (
                      <div
                        key={vault.id}
                        className={`vault-item p-3 mb-2 rounded-3 cursor-pointer position-relative ${
                          selectedVault?.id === vault.id ? 'bg-primary text-white' : 'bg-light'
                        }`}
                        onClick={() => handleVaultSelect(vault)}
                      >
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 d-flex align-items-center">
                              <ShieldIcon
                                width={14}
                                height={14}
                                className={`me-2 ${
                                  selectedVault?.id === vault.id ? 'text-white' : 'text-primary'
                                }`}
                              />
                              {vault.name}
                            </h6>
                            {vault.description && (
                              <p className={`small mb-1 ${
                                selectedVault?.id === vault.id ? 'text-white-50' : 'text-muted'
                              }`}>
                                {vault.description}
                              </p>
                            )}
                            <div className={`small ${
                              selectedVault?.id === vault.id ? 'text-white-50' : 'text-muted'
                            }`}>
                              {formatDate(vault.createdAt)}
                            </div>
                          </div>
                          
                          {/* 메뉴 버튼 */}
                          <div className="position-relative">
                            <button
                              className={`btn btn-sm ${
                                selectedVault?.id === vault.id 
                                  ? 'btn-outline-light' 
                                  : 'btn-outline-secondary'
                              } rounded-circle p-1`}
                              onClick={(e) => toggleVaultMenu(vault.id, e)}
                              style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            >
                              ⋯
                            </button>
                            
                            {/* 드롭다운 메뉴 */}
                            {showVaultMenu === vault.id && (
                              <div 
                                className="dropdown-menu show position-absolute"
                                style={{ right: 0, top: '100%', zIndex: 1000 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="dropdown-item small"
                                  onClick={() => {
                                    // 수정 기능 구현 예정
                                    alert('수정 기능 구현 예정')
                                    setShowVaultMenu(null)
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  className="dropdown-item small text-danger"
                                  onClick={() => handleDeleteVault(vault.id, vault.name)}
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 선택된 Vault의 아이템들 */}
            <div className="col-md-8 col-lg-9">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                {selectedVault ? (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h3 className="h5 fw-semibold text-dark mb-1 d-flex align-items-center">
                          <ShieldIcon width={20} height={20} className="me-2 text-primary" />
                          {selectedVault.name}
                        </h3>
                        {selectedVault.description && (
                          <p className="text-muted small mb-0">{selectedVault.description}</p>
                        )}
                      </div>
                      <button 
                        className="btn btn-primary btn-sm rounded-pill px-3"
                        onClick={handleAddItem}
                      >
                        + 새 아이템 추가
                      </button>
                    </div>

                    {/* Vault 아이템 목록 */}
                    <div className="vault-items">
                      <div className="text-center py-5">
                        <div className="text-muted mb-3">
                          <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                          </svg>
                        </div>
                        <h4 className="h6 text-muted mb-2">아직 저장된 아이템이 없습니다</h4>
                        <p className="text-muted small">첫 번째 비밀번호나 보안 정보를 추가해보세요!</p>
                      </div>
                    </div>

                    {/* 아이템 추가 모달 */}
                    <AddAccountForm
                      vaultId={selectedVault.id}
                      secretKey={secretKey}
                      onSubmit={handleSubmitItem}
                      onCancel={handleCancelAddItem}
                      isLoading={isCreatingItem}
                      show={showAddItemForm}
                    />
                  </>
                ) : (
                  <div className="text-center py-5">
                    <ShieldIcon width={48} height={48} className="text-muted mb-3" />
                    <h3 className="h5 text-muted mb-2">Vault를 선택해주세요</h3>
                    <p className="text-muted">왼쪽에서 Vault를 선택하면 저장된 아이템들을 확인할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Vault 생성 모달 */}
      {showCreateModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleModalClose}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <ShieldIcon width={20} height={20} className="me-2" />
                  새 Vault 생성
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                  disabled={isCreating}
                ></button>
              </div>
              <div className="modal-body">
                {createError && (
                  <div className="alert alert-danger" role="alert">
                    {createError}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="vaultName" className="form-label">
                    Vault 이름 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="vaultName"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    placeholder="예: 개인 계정들"
                    disabled={isCreating}
                    maxLength={100}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="vaultDescription" className="form-label">
                    설명 (선택사항)
                  </label>
                  <textarea
                    className="form-control"
                    id="vaultDescription"
                    rows={3}
                    value={vaultDescription}
                    onChange={(e) => setVaultDescription(e.target.value)}
                    placeholder="이 Vault에 대한 간단한 설명을 입력하세요"
                    disabled={isCreating}
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                  disabled={isCreating}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateVault}
                  disabled={isCreating || !vaultName.trim()}
                >
                  {isCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      생성 중...
                    </>
                  ) : (
                    'Vault 생성'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default HomePage
