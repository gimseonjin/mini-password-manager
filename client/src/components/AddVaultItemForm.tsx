import React, { useState } from 'react'
import { VaultItemType, AccountData, CreateVaultItemRequest } from '../types/vault'
import { EyeIcon, EyeSlashIcon, ShieldIcon } from './icons'

interface AddAccountFormProps {
  vaultId: string
  onSubmit: (data: CreateVaultItemRequest) => void
  onCancel: () => void
  isLoading?: boolean
  show: boolean
}

interface AccountFormData {
  loginId: string
  password: string
  website: string
  notes: string
}

const AddAccountForm: React.FC<AddAccountFormProps> = ({
  vaultId,
  onSubmit,
  onCancel,
  isLoading = false,
  show
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    loginId: '',
    password: '',
    website: '',
    notes: ''
  })

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [errors, setErrors] = useState<Partial<AccountFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<AccountFormData> = {}

    if (!formData.loginId.trim()) {
      newErrors.loginId = '로그인 ID는 필수 항목입니다'
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호는 필수 항목입니다'
    } else if (formData.password.length < 1) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    if (!formData.website.trim()) {
      newErrors.website = '웹사이트 주소는 필수 항목입니다'
    } else if (!isValidUrl(formData.website)) {
      newErrors.website = '올바른 웹사이트 주소 형식이 아닙니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 입력시 해당 필드의 에러 제거
    if (errors[name as keyof AccountFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const extractDomainName = (url: string): string => {
    if (!url) return '새 계정'
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      const hostname = urlObj.hostname
      // www. 제거하고 첫 번째 도메인 부분만 추출
      const domain = hostname.replace(/^www\./, '').split('.')[0]
      return domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : '새 계정'
    } catch {
      // URL이 유효하지 않으면 입력값에서 도메인 추출 시도
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/)
      return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : '새 계정'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const accountData: AccountData = {
      loginId: formData.loginId,
      password: formData.password,
      website: formData.website
    }

    const accountName = extractDomainName(formData.website)

    const createRequest: CreateVaultItemRequest = {
      vaultId,
      type: VaultItemType.ACCOUNT,
      name: accountName,
      data: accountData,
      favorite: false,
      notes: formData.notes || undefined
    }

    onSubmit(createRequest)
  }

  const handleModalClose = (e?: React.MouseEvent) => {
    if (e && e.target === e.currentTarget) {
      onCancel()
    }
  }

  if (!show) return null

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleModalClose}
    >
      <div 
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white border-0 py-4">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                <ShieldIcon width={24} height={24} className="text-white" />
              </div>
              <div>
                <h4 className="modal-title mb-0 fw-bold">새 계정 추가</h4>
                <small className="opacity-75">안전하게 계정 정보를 저장하세요</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onCancel}
              disabled={isLoading}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} id="accountForm">
              <div className="row g-4">
                {/* 로그인 ID */}
                <div className="col-12">
                  <label className="form-label fw-medium mb-2">
                    로그인 ID <span className="text-danger">*</span>
                  </label>
                  <div className="form-floating">
                    <input
                      type="text"
                      id="loginId"
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleInputChange}
                      className={`form-control ${errors.loginId ? 'is-invalid' : ''}`}
                      placeholder="로그인 ID를 입력하세요"
                      disabled={isLoading}
                      autoFocus
                    />
                    <label htmlFor="loginId" className="fw-medium">
                      로그인 ID <span className="text-danger">*</span>
                    </label>
                    {errors.loginId && (
                      <div className="invalid-feedback">
                        {errors.loginId}
                      </div>
                    )}
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="col-12">
                  <label className="form-label fw-medium mb-2">
                    비밀번호 <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-lg">
                    <div className="form-floating flex-grow-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="비밀번호를 입력하세요"
                        disabled={isLoading}
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <label htmlFor="password">비밀번호</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-outline-secondary px-3"
                      disabled={isLoading}
                      title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-danger small mt-1">
                      {errors.password}
                    </div>
                  )}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: '4px' }}>
                        <div 
                          className={`progress-bar ${
                            formData.password.length >= 12 ? 'bg-success' :
                            formData.password.length >= 8 ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (formData.password.length / 12) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        비밀번호 강도: {
                          formData.password.length >= 12 ? '강함' :
                          formData.password.length >= 8 ? '보통' : '약함'
                        }
                      </small>
                    </div>
                  )}
                </div>

                {/* 웹사이트 */}
                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                      placeholder="https://example.com"
                      disabled={isLoading}
                    />
                    <label htmlFor="website" className="fw-medium">
                      웹사이트 주소 <span className="text-danger">*</span>
                    </label>
                    {errors.website && (
                      <div className="invalid-feedback">
                        {errors.website}
                      </div>
                    )}
                  </div>
                </div>

                {/* 메모 */}
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="추가 정보나 메모를 입력하세요"
                      style={{ minHeight: '100px' }}
                      disabled={isLoading}
                    />
                    <label htmlFor="notes" className="fw-medium">메모</label>
                  </div>
                  <div className="form-text text-muted">
                    📝 추가 정보나 힌트를 기록하세요
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light border-0 p-4">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline-secondary px-4"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                form="accountForm"
                className="btn btn-primary px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    저장 중...
                  </>
                ) : (
                  <>
                    <ShieldIcon width={16} height={16} className="me-2" />
                    안전하게 저장
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAccountForm 