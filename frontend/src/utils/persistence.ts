import { ref, watch, type Ref } from 'vue'
import { safeLocalStorageOperation } from '../utils/errorHandler'

// Persistence utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  safeLocalStorageOperation(
    () => localStorage.setItem(key, JSON.stringify(data)),
    undefined,
    `saving to localStorage key: ${key}`
  )
}

export const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  return safeLocalStorageOperation(
    () => {
      const stored = localStorage.getItem(key)
      if (!stored) return fallback
      const parsed = JSON.parse(stored)
      return parsed as T
    },
    fallback,
    `loading from localStorage key: ${key}`
  )
}

// Composable for persistent reactive state
export const usePersistentState = <T>(
  key: string, 
  initialValue: T,
  options: { deep?: boolean } = { deep: true }
): [Ref<T>, () => void] => {
  // Load initial value from localStorage
  const storedValue = loadFromLocalStorage(key, initialValue)
  const state = ref<T>(storedValue) as Ref<T>
  
  // Save to localStorage when state changes
  const saveState = () => saveToLocalStorage(key, state.value)
  
  // Watch for changes and auto-save
  watch(state, saveState, { deep: options.deep })
  
  return [state, saveState]
}