import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateUniqueId } from '../utils/idGenerator'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  isEditing?: boolean
  editText?: string
}

export const useTodoStore = defineStore('todos', () => {
  // State
  const todos = ref<Todo[]>([])
  
  // Load from localStorage on store creation
  const loadTodos = () => {
    try {
      const stored = localStorage.getItem('lifetool-todos')
      if (stored) {
        const parsed = JSON.parse(stored)
        todos.value = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
        }))
      }
    } catch (error) {
      console.warn('Failed to load todos from localStorage:', error)
    }
  }
  
  // Save to localStorage
  const saveTodos = () => {
    try {
      localStorage.setItem('lifetool-todos', JSON.stringify(todos.value))
    } catch (error) {
      console.warn('Failed to save todos to localStorage:', error)
    }
  }
  
  // Getters
  const completedCount = computed(() => 
    todos.value.filter(todo => todo.completed).length
  )
  
  const remainingCount = computed(() => 
    todos.value.filter(todo => !todo.completed).length
  )
  
  const allCompleted = computed(() => 
    todos.value.length > 0 && completedCount.value === todos.value.length
  )
  
  // Actions
  const addTodo = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) throw new Error('Todo cannot be empty')
    if (trimmed.length > 200) throw new Error('Todo cannot exceed 200 characters')
    if (todos.value.some(todo => todo.text.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('This todo already exists')
    }
    
    todos.value.push({
      id: generateUniqueId(),
      text: trimmed,
      completed: false,
      createdAt: new Date()
    })
    saveTodos()
  }
  
  const removeTodo = (id: string) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      todos.value.splice(index, 1)
      saveTodos()
    }
  }
  
  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      if (todo.completed) {
        todo.completedAt = new Date()
      } else {
        delete todo.completedAt
      }
      saveTodos()
    }
  }
  
  const updateTodo = (id: string, text: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo && text.trim()) {
      todo.text = text.trim()
      saveTodos()
    }
  }
  
  const markAllComplete = () => {
    const now = new Date()
    todos.value.forEach(todo => {
      if (!todo.completed) {
        todo.completed = true
        todo.completedAt = now
      }
    })
    saveTodos()
  }
  
  const clearCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
    saveTodos()
  }
  
  // Initialize store
  loadTodos()
  
  return {
    // State
    todos,
    // Getters
    completedCount,
    remainingCount,
    allCompleted,
    // Actions
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodo,
    markAllComplete,
    clearCompleted
  }
})