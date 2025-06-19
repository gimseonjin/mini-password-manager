// 유틸리티 함수 샘플
// 프로젝트 전반에서 사용할 수 있는 헬퍼 함수들을 정의합니다

// 날짜 포맷팅
export function formatDate(date, locale = 'ko-KR') {
  return new Date(date).toLocaleDateString(locale)
}

// 문자열 자르기
export function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// 디바운스 함수
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 로컬 스토리지 헬퍼
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}
