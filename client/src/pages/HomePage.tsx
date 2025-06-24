import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, getCachedUser } from '../services/AuthService'
import { createVault, getVaults, deleteVault, getVaultItemsDecrypted } from '../services/VaultService'
import { CreateVaultRequest, AddVaultItemResponseDto, FetchVaultsResponse, VaultItemDto } from '../types/vault'
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
  const [vaultItems, setVaultItems] = useState<(VaultItemDto & { decryptedData?: any })[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [itemsError, setItemsError] = useState('')
  const [selectedItem, setSelectedItem] = useState<(VaultItemDto & { decryptedData?: any }) | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)

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

  // selectedVault가 변경되면 해당 vault의 아이템들을 로드
  useEffect(() => {
    if (selectedVault && secretKey) {
      loadVaultItems(selectedVault.id)
    } else {
      setVaultItems([])
    }
  }, [selectedVault, secretKey])

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

  const loadVaultItems = async (vaultId: string) => {
    if (!secretKey) {
      setItemsError('시크릿 키가 설정되지 않았습니다.')
      return
    }

    try {
      setIsLoadingItems(true)
      setItemsError('')
      const items = await getVaultItemsDecrypted(vaultId, secretKey)
      setVaultItems(items)
    } catch (error) {
      if (error instanceof Error) {
        setItemsError(error.message)
      } else {
        setItemsError('Vault 아이템을 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoadingItems(false)
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
      
      // vault item 목록 새로고침
      if (selectedVault) {
        await loadVaultItems(selectedVault.id)
      }
      
    } catch (error) {
      if (error instanceof Error) {
        alert(`오류: ${error.message}`)
      } else {
        alert('계정 추가 중 오류가 발생했습니다.')
      }
    }
  }

  const handleItemClick = (item: VaultItemDto & { decryptedData?: any }) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const handleCloseItemModal = () => {
    setShowItemModal(false)
    setSelectedItem(null)
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // 간단한 토스트 알림 대신 alert 사용 (추후 토스트로 개선 가능)
      alert(`${fieldName}이(가) 클립보드에 복사되었습니다!`)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login':
        return '🔐'
      case 'note':
        return '📝'
      case 'card':
        return '💳'
      case 'identity':
        return '👤'
      default:
        return '🔒'
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login':
        return '로그인'
      case 'note':
        return '보안 메모'
      case 'card':
        return '카드'
      case 'identity':
        return '신원 정보'
      default:
        return type
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
                      {itemsError && (
                        <div className="alert alert-danger alert-sm" role="alert">
                          {itemsError}
                        </div>
                      )}

                      {isLoadingItems ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">로딩 중...</span>
                          </div>
                          <p className="mt-2 text-muted small">아이템을 불러오는 중...</p>
                        </div>
                      ) : vaultItems.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="text-muted mb-3">
                            <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                            </svg>
                          </div>
                          <h4 className="h6 text-muted mb-2">아직 저장된 아이템이 없습니다</h4>
                          <p className="text-muted small">첫 번째 비밀번호나 보안 정보를 추가해보세요!</p>
                        </div>
                      ) : (
                        <div className="item-list">
                          {vaultItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="item-card bg-light rounded-3 p-3 mb-3 cursor-pointer hover-shadow"
                              onClick={() => handleItemClick(item)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: '1px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0d6efd'
                                e.currentTarget.style.backgroundColor = '#f8f9fa'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent'
                                e.currentTarget.style.backgroundColor = '#f8f9fa'
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center flex-grow-1">
                                  <div className="item-icon me-3">
                                    <span style={{ fontSize: '24px' }}>
                                      {getItemIcon(item.type)}
                                    </span>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1">
                                      <h6 className="mb-0 fw-semibold text-dark">{item.title}</h6>
                                      <span className="badge bg-primary rounded-pill ms-2 small">
                                        {getItemTypeLabel(item.type)}
                                      </span>
                                    </div>
                                    {/* 미리 보기 정보 */}
                                    <div className="preview-info">
                                      {item.decryptedData ? (
                                        <div className="text-muted small">
                                          {item.type === 'login' && item.decryptedData.username && (
                                            <span>사용자: {item.decryptedData.username}</span>
                                          )}
                                          {item.type === 'login' && item.decryptedData.website && (
                                            <span className={item.decryptedData.username ? 'ms-2' : ''}>
                                              {item.decryptedData.website}
                                            </span>
                                          )}
                                          {item.type === 'note' && (
                                            <span>보안 메모</span>
                                          )}
                                          {item.type === 'card' && item.decryptedData.cardNumber && (
                                            <span>카드: ****{item.decryptedData.cardNumber.slice(-4)}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-warning small">
                                          클릭하여 복호화
                                        </div>
                                      )}
                                    </div>
                                    <div className="small text-muted mt-1">
                                      수정: {formatDate(item.updatedAt)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="item-actions d-flex align-items-center">
                                  <button 
                                    className="btn btn-sm btn-outline-secondary rounded-circle p-1 me-2"
                                    style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                    title="수정"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert('수정 기능 구현 예정')
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger rounded-circle p-1"
                                    style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                    title="삭제"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert('삭제 기능 구현 예정')
                                    }}
                                  >
                                    🗑️
                                  </button>
                                  <div className="ms-2 text-muted">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

      {/* 아이템 상세 모달 */}
      {showItemModal && selectedItem && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          onClick={handleCloseItemModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <span className="me-3" style={{ fontSize: '24px' }}>
                    {getItemIcon(selectedItem.type)}
                  </span>
                  <div>
                    <h5 className="modal-title mb-0">{selectedItem.title}</h5>
                    <small className="opacity-75">{getItemTypeLabel(selectedItem.type)}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseItemModal}
                ></button>
              </div>
              <div className="modal-body">
                {selectedItem.decryptedData ? (
                  <div className="item-details">
                    {/* 로그인 타입 */}
                    {selectedItem.type === 'login' && (
                      <div>
                        {selectedItem.decryptedData.username && (
                          <div className="mb-3">
                            <label className="form-label small text-muted fw-semibold">사용자명</label>
                            <div className="input-group">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={selectedItem.decryptedData.username} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(selectedItem.decryptedData.username, '사용자명')}
                                title="복사"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedItem.decryptedData.password && (
                          <div className="mb-3">
                            <label className="form-label small text-muted fw-semibold">비밀번호</label>
                            <div className="input-group">
                              <input 
                                type="password" 
                                className="form-control" 
                                value={selectedItem.decryptedData.password} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(selectedItem.decryptedData.password, '비밀번호')}
                                title="복사"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedItem.decryptedData.website && (
                          <div className="mb-3">
                            <label className="form-label small text-muted fw-semibold">웹사이트</label>
                            <div className="input-group">
                              <input 
                                type="url" 
                                className="form-control" 
                                value={selectedItem.decryptedData.website} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(selectedItem.decryptedData.website, '웹사이트')}
                                title="복사"
                              >
                                📋
                              </button>
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => window.open(selectedItem.decryptedData.website, '_blank')}
                                title="새 탭에서 열기"
                              >
                                🔗
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 보안 메모 타입 */}
                    {selectedItem.type === 'note' && selectedItem.decryptedData.content && (
                      <div className="mb-3">
                        <label className="form-label small text-muted fw-semibold">내용</label>
                        <div className="position-relative">
                          <textarea 
                            className="form-control" 
                            rows={6}
                            value={selectedItem.decryptedData.content} 
                            readOnly 
                          />
                          <button 
                            className="btn btn-outline-secondary btn-sm position-absolute"
                            style={{ top: '8px', right: '8px' }}
                            onClick={() => copyToClipboard(selectedItem.decryptedData.content, '내용')}
                            title="복사"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 카드 타입 */}
                    {selectedItem.type === 'card' && (
                      <div>
                        {selectedItem.decryptedData.cardholderName && (
                          <div className="mb-3">
                            <label className="form-label small text-muted fw-semibold">카드 소유자명</label>
                            <div className="input-group">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={selectedItem.decryptedData.cardholderName} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(selectedItem.decryptedData.cardholderName, '카드 소유자명')}
                                title="복사"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedItem.decryptedData.cardNumber && (
                          <div className="mb-3">
                            <label className="form-label small text-muted fw-semibold">카드 번호</label>
                            <div className="input-group">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={selectedItem.decryptedData.cardNumber} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(selectedItem.decryptedData.cardNumber, '카드 번호')}
                                title="복사"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="row">
                          {selectedItem.decryptedData.expirationMonth && selectedItem.decryptedData.expirationYear && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label small text-muted fw-semibold">만료일</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={`${selectedItem.decryptedData.expirationMonth}/${selectedItem.decryptedData.expirationYear}`} 
                                readOnly 
                              />
                            </div>
                          )}
                          {selectedItem.decryptedData.securityCode && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label small text-muted fw-semibold">보안 코드</label>
                              <div className="input-group">
                                <input 
                                  type="password" 
                                  className="form-control" 
                                  value={selectedItem.decryptedData.securityCode} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => copyToClipboard(selectedItem.decryptedData.securityCode, '보안 코드')}
                                  title="복사"
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 공통 메모 필드 */}
                    {selectedItem.decryptedData.notes && (
                      <div className="mb-3">
                        <label className="form-label small text-muted fw-semibold">메모</label>
                        <div className="position-relative">
                          <textarea 
                            className="form-control" 
                            rows={3}
                            value={selectedItem.decryptedData.notes} 
                            readOnly 
                          />
                          <button 
                            className="btn btn-outline-secondary btn-sm position-absolute"
                            style={{ top: '8px', right: '8px' }}
                            onClick={() => copyToClipboard(selectedItem.decryptedData.notes, '메모')}
                            title="복사"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 메타데이터 */}
                    <div className="border-top pt-3 mt-4">
                      <div className="row text-muted small">
                        <div className="col-md-6">
                          <strong>생성일:</strong> {formatDate(selectedItem.createdAt)}
                        </div>
                        <div className="col-md-6">
                          <strong>수정일:</strong> {formatDate(selectedItem.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-warning mb-3">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                      </svg>
                    </div>
                    <h6 className="text-warning">복호화 실패</h6>
                    <p className="text-muted">이 아이템의 데이터를 복호화할 수 없습니다. 시크릿 키를 확인해주세요.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => alert('수정 기능 구현 예정')}
                >
                  ✏️ 수정
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-danger"
                  onClick={() => alert('삭제 기능 구현 예정')}
                >
                  🗑️ 삭제
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseItemModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
