import { useEffect, useState } from 'react'

// useDebounce Hook
export const useDebounce = <T>(value: T, delay: number) => {
  // デバウンスされた値を保持するためのステート
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 指定されたディレイ後に値をセットするタイマーを設定
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // クリーンアップ関数：コンポーネントがアンマウントされるか、値が更新された場合にタイマーをクリア
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // 依存配列にvalueとdelayを設定

  return debouncedValue
}
