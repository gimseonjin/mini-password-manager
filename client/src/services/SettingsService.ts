/**
 * 설정 관련 서비스
 * 비밀키 생성, 저장, 로드, 마스킹 등의 기능을 제공합니다.
 */

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// 사용자별 secretkey 저장을 위한 접두사
const SECRET_KEY_PREFIX = 'secretKey_user_'
const SECRET_KEY_LENGTH = 64
const LEGACY_SECRET_KEY = 'secretKey'

/**
 * 사용자별 비밀키 저장소 키를 생성합니다.
 * @param userId 사용자 ID
 * @returns 사용자별 저장소 키
 */
const getUserSecretKeyStorageKey = (userId: string): string => {
  return `${SECRET_KEY_PREFIX}${userId}`
}

/**
 * 랜덤한 비밀키를 생성합니다.
 * @returns 64자리의 랜덤 문자열
 */
export const generateSecretKey = (): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-'
  let result = ''
  for (let i = 0; i < SECRET_KEY_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 사용자별 비밀키를 localStorage에서 로드합니다.
 * @param userId 사용자 ID
 * @returns 비밀키 문자열 또는 null
 */
export const loadUserSecretKey = (userId: string): string | null => {
  const storageKey = getUserSecretKeyStorageKey(userId)
  return localStorage.getItem(storageKey)
}

/**
 * 사용자별 비밀키를 localStorage에 저장합니다.
 * @param userId 사용자 ID
 * @param key 저장할 비밀키
 */
export const saveUserSecretKey = (userId: string, key: string): void => {
  const storageKey = getUserSecretKeyStorageKey(userId)
  localStorage.setItem(storageKey, key)
}

/**
 * 사용자별 새로운 비밀키를 생성하고 저장합니다.
 * @param userId 사용자 ID
 * @returns 새로 생성된 비밀키
 */
export const generateAndSaveUserSecretKey = (userId: string): string => {
  const newKey = generateSecretKey()
  saveUserSecretKey(userId, newKey)
  return newKey
}

/**
 * 사용자별 비밀키를 삭제합니다.
 * @param userId 사용자 ID
 */
export const removeUserSecretKey = (userId: string): void => {
  const storageKey = getUserSecretKeyStorageKey(userId)
  localStorage.removeItem(storageKey)
}

/**
 * 사용자별 비밀키가 존재하는지 확인합니다.
 * @param userId 사용자 ID
 * @returns 비밀키 존재 여부
 */
export const hasUserSecretKey = (userId: string): boolean => {
  const storageKey = getUserSecretKeyStorageKey(userId)
  return localStorage.getItem(storageKey) !== null
}

/**
 * 비밀키를 마스킹 처리합니다.
 * 앞 4자리와 뒤 4자리만 보여주고 중간은 *로 처리합니다.
 * @param key 마스킹할 비밀키
 * @returns 마스킹된 비밀키 문자열
 */
export const maskSecretKey = (key: string): string => {
  if (key.length <= 8) return key
  return (
    key.substring(0, 4) +
    '*'.repeat(key.length - 8) +
    key.substring(key.length - 4)
  )
}

/**
 * QR 코드 생성을 위한 데이터를 생성합니다.
 * @param userId 사용자 ID
 * @param secretKey 비밀키
 * @returns QR 코드 데이터
 */
export const generateQRData = (userId: string, secretKey: string): string => {
  const qrData = {
    type: 'mini-password-manager',
    version: '1.0',
    userId,
    secretKey,
    timestamp: Date.now()
  }
  return JSON.stringify(qrData)
}

/**
 * QR 코드 데이터를 파싱합니다.
 * @param qrData QR 코드에서 읽은 데이터
 * @returns 파싱된 데이터 또는 null
 */
export const parseQRData = (qrData: string): { userId: string; secretKey: string } | null => {
  try {
    const parsed = JSON.parse(qrData)
    if (
      parsed.type === 'mini-password-manager' &&
      parsed.userId &&
      parsed.secretKey
    ) {
      return {
        userId: parsed.userId,
        secretKey: parsed.secretKey
      }
    }
    return null
  } catch (error) {
    console.error('QR 데이터 파싱 실패:', error)
    return null
  }
}

/**
 * PDF 백업용 데이터를 생성합니다.
 * @param userId 사용자 ID
 * @param userEmail 사용자 이메일
 * @param secretKey 비밀키
 * @returns PDF 생성용 데이터
 */
export const generatePDFBackupData = (
  userId: string,
  userEmail: string,
  secretKey: string
): {
  userId: string
  userEmail: string
  secretKey: string
  qrData: string
  createdAt: string
} => {
  return {
    userId,
    userEmail,
    secretKey,
    qrData: generateQRData(userId, secretKey),
    createdAt: new Date().toLocaleString('ko-KR')
  }
}

/**
 * PDF 백업 파일을 생성하고 다운로드합니다.
 * @param userId 사용자 ID
 * @param userEmail 사용자 이메일
 * @param secretKey 비밀키
 */
export const downloadPDFBackup = async (
  userId: string,
  userEmail: string,
  secretKey: string
): Promise<void> => {
  const pdfData = generatePDFBackupData(userId, userEmail, secretKey)
  
  // PDF 문서 생성
  const doc = new jsPDF()
  const margin = 20
  let yPosition = 30
  
  // 제목 설정
  doc.setFontSize(18)
  doc.text('Mini Password Manager - Backup Information', margin, yPosition)
  
  yPosition += 20
  doc.setFontSize(12)
  
  // 사용자 정보
  doc.text(`User Email: ${pdfData.userEmail}`, margin, yPosition)
  yPosition += 10
  doc.text(`User ID: ${pdfData.userId}`, margin, yPosition)
  
  yPosition += 20
  
  // 경고 메시지
  doc.setFontSize(14)
  doc.setTextColor(255, 0, 0) // 빨간색
  doc.text('WARNING - IMPORTANT NOTICE', margin, yPosition)
  
  yPosition += 15
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0) // 검은색
  doc.text('• This backup file contains very important information.', margin, yPosition)
  yPosition += 8
  doc.text('• Store it in a safe place and keep it away from others.', margin, yPosition)
  yPosition += 8
  doc.text('• Without this information, you will lose all saved passwords.', margin, yPosition)
  
  yPosition += 20
  
  // 비밀키 정보
  doc.setFontSize(12)
  doc.text('Encryption Key:', margin, yPosition)
  yPosition += 10
  doc.setFontSize(10)
  doc.text(pdfData.secretKey, margin, yPosition)
  
  yPosition += 20
  
  // QR 코드 이미지 생성 및 삽입
  doc.setFontSize(12)
  doc.text('QR Code:', margin, yPosition)
  yPosition += 15
  
  try {
    // QR 코드 이미지를 Data URL로 생성
    const qrCodeDataURL = await QRCode.toDataURL(pdfData.qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // PDF에 QR 코드 이미지 삽입
    doc.addImage(qrCodeDataURL, 'PNG', margin, yPosition, 50, 50)
    yPosition += 60
  } catch (error) {
    console.error('QR 코드 생성 실패:', error)
    // QR 코드 생성 실패시 텍스트로 대체
    doc.setFontSize(8)
    doc.text('QR Code generation failed. Raw data:', margin, yPosition)
    yPosition += 10
    const qrLines = doc.splitTextToSize(pdfData.qrData, 170)
    qrLines.forEach((line: string) => {
      doc.text(line, margin, yPosition)
      yPosition += 6
    })
    yPosition += 15
  }
  
  // 복원 방법 안내
  doc.setFontSize(12)
  doc.text('How to Restore Backup:', margin, yPosition)
  yPosition += 10
  doc.setFontSize(10)
  doc.text('1. Go to Settings page and click "Import Key"', margin, yPosition)
  yPosition += 8
  doc.text('2. Scan the QR Code above or copy the raw data below:', margin, yPosition)
  yPosition += 8
  doc.text('3. Click "Import" button to complete restoration', margin, yPosition)
  
  yPosition += 15
  
  // QR 코드 원본 데이터도 텍스트로 추가 (백업용)
  doc.setFontSize(8)
  doc.text('Raw QR Data (for manual copy):', margin, yPosition)
  yPosition += 8
  const qrLines = doc.splitTextToSize(pdfData.qrData, 170)
  qrLines.forEach((line: string) => {
    doc.text(line, margin, yPosition)
    yPosition += 4
  })
  
  // PDF 다운로드
  const fileName = `PasswordManager_Backup_${userEmail}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// ===== 로컬 스토리지 정리 함수들 =====

/**
 * 레거시 secretKey를 삭제합니다.
 */
export const removeLegacySecretKey = (): void => {
  const legacyKey = localStorage.getItem(LEGACY_SECRET_KEY)
  if (legacyKey) {
    localStorage.removeItem(LEGACY_SECRET_KEY)
  }
}

/**
 * 현재 사용자를 제외한 다른 사용자의 키들을 모두 삭제합니다.
 * @param currentUserId 현재 사용자 ID (유지할 키)
 */
export const cleanupOtherUsersKeys = (currentUserId: string): void => {
  const currentUserKey = getUserSecretKeyStorageKey(currentUserId)
  const keysToRemove: string[] = []
  
  // localStorage의 모든 키를 확인
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(SECRET_KEY_PREFIX) && key !== currentUserKey) {
      keysToRemove.push(key)
    }
  }
  
  // 다른 사용자의 키들 삭제
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * 사용자 로그인 시 키 정리를 수행합니다.
 * 레거시 키 삭제 + 다른 사용자 키 정리
 * @param currentUserId 현재 로그인한 사용자 ID
 */
export const performLoginKeyCleanup = (currentUserId: string): void => {
  // 1. 레거시 키 삭제
  removeLegacySecretKey()
  
  // 2. 다른 사용자 키 정리
  cleanupOtherUsersKeys(currentUserId)
}


