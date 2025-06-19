/**
 * 설정 관련 서비스
 * 비밀키 생성, 저장, 로드, 마스킹 등의 기능을 제공합니다.
 */

const SECRET_KEY_STORAGE_KEY = 'secretKey'
const SECRET_KEY_LENGTH = 64

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
 * localStorage에서 비밀키를 로드합니다.
 * 비밀키가 없으면 새로 생성하여 저장합니다.
 * @returns 비밀키 문자열
 */
export const loadSecretKey = (): string => {
  let key = localStorage.getItem(SECRET_KEY_STORAGE_KEY)
  if (!key) {
    key = generateSecretKey()
    localStorage.setItem(SECRET_KEY_STORAGE_KEY, key)
  }
  return key
}

/**
 * 비밀키를 localStorage에 저장합니다.
 * @param key 저장할 비밀키
 */
export const saveSecretKey = (key: string): void => {
  localStorage.setItem(SECRET_KEY_STORAGE_KEY, key)
}

/**
 * 새로운 비밀키를 생성하고 저장합니다.
 * @returns 새로 생성된 비밀키
 */
export const refreshSecretKey = (): string => {
  const newKey = generateSecretKey()
  saveSecretKey(newKey)
  return newKey
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
 * localStorage에서 비밀키를 삭제합니다.
 */
export const removeSecretKey = (): void => {
  localStorage.removeItem(SECRET_KEY_STORAGE_KEY)
}

/**
 * 현재 저장된 비밀키가 있는지 확인합니다.
 * @returns 비밀키 존재 여부
 */
export const hasSecretKey = (): boolean => {
  return localStorage.getItem(SECRET_KEY_STORAGE_KEY) !== null
}
