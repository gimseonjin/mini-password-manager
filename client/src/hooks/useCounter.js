// 커스텀 훅 샘플
// 재사용 가능한 로직을 훅으로 분리합니다

import { useState } from 'react'

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount((prev) => prev + 1)
  const decrement = () => setCount((prev) => prev - 1)
  const reset = () => setCount(initialValue)

  return {
    count,
    increment,
    decrement,
    reset,
  }
}
