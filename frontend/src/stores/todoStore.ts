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
  tags: string[]
}

export const useTodoStore = defineStore('todos', () => {
  // State
  const todos = ref<Todo[]>([])
  const activeTag = ref<string>('all')
  
  // Load from localStorage on store creation
  const loadTodos = () => {
    try {
      const stored = localStorage.getItem('lifetool-todos')
      const storedActiveTag = localStorage.getItem('lifetool-active-tag')
      
      if (stored) {
        const parsed = JSON.parse(stored)
        todos.value = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          tags: todo.tags || [] // Handle migration from old todos without tags
        }))
      }
      
      if (storedActiveTag) {
        activeTag.value = storedActiveTag
      }
    } catch (error) {
      console.warn('Failed to load todos from localStorage:', error)
    }
  }
  
  // Save to localStorage
  const saveTodos = () => {
    try {
      localStorage.setItem('lifetool-todos', JSON.stringify(todos.value))
      localStorage.setItem('lifetool-active-tag', activeTag.value)
    } catch (error) {
      console.warn('Failed to save todos to localStorage:', error)
    }
  }
  
  // Getters
  const allTags = computed(() => {
    const tagSet = new Set<string>()
    todos.value.forEach(todo => {
      todo.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })
  
  const filteredTodos = computed(() => {
    if (activeTag.value === 'all') {
      return todos.value
    }
    if (activeTag.value === 'untagged') {
      return todos.value.filter(todo => todo.tags.length === 0)
    }
    return todos.value.filter(todo => todo.tags.includes(activeTag.value))
  })
  
  const completedCount = computed(() => 
    filteredTodos.value.filter(todo => todo.completed).length
  )
  
  const remainingCount = computed(() => 
    filteredTodos.value.filter(todo => !todo.completed).length
  )
  
  const allCompleted = computed(() => 
    filteredTodos.value.length > 0 && completedCount.value === filteredTodos.value.length
  )
  
  const totalTodosByTag = computed(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    
    // Count all todos
    counts['all'] = {
      total: todos.value.length,
      completed: todos.value.filter(t => t.completed).length
    }
    
    // Count untagged todos
    const untaggedTodos = todos.value.filter(t => t.tags.length === 0)
    counts['untagged'] = {
      total: untaggedTodos.length,
      completed: untaggedTodos.filter(t => t.completed).length
    }
    
    // Count by individual tags
    allTags.value.forEach(tag => {
      const tagTodos = todos.value.filter(t => t.tags.includes(tag))
      counts[tag] = {
        total: tagTodos.length,
        completed: tagTodos.filter(t => t.completed).length
      }
    })
    
    return counts
  })
  
  // Actions
  const setActiveTag = (tag: string) => {
    activeTag.value = tag
    saveTodos()
  }
  
  const addTodo = (text: string, tags: string[] = []) => {
    const trimmed = text.trim()
    if (!trimmed) throw new Error('Todo cannot be empty')
    if (trimmed.length > 200) throw new Error('Todo cannot exceed 200 characters')
    
    // Check for duplicates within the same tag scope
    const scopedTodos = tags.length > 0 
      ? todos.value.filter(todo => todo.tags.some(tag => tags.includes(tag)))
      : todos.value.filter(todo => todo.tags.length === 0)
    
    if (scopedTodos.some(todo => todo.text.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('This todo already exists in the selected scope')
    }
    
    // If we're in a specific tag view and no tags provided, use the active tag
    const finalTags = tags.length > 0 ? tags : 
      (activeTag.value !== 'all' && activeTag.value !== 'untagged' ? [activeTag.value] : [])
    
    todos.value.push({
      id: generateUniqueId(),
      text: trimmed,
      completed: false,
      createdAt: new Date(),
      tags: finalTags
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
  
  const updateTodoTags = (id: string, tags: string[]) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.tags = tags
      saveTodos()
    }
  }
  
  const addTagToTodo = (id: string, tag: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo && !todo.tags.includes(tag)) {
      todo.tags.push(tag)
      saveTodos()
    }
  }
  
  const removeTagFromTodo = (id: string, tag: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.tags = todo.tags.filter(t => t !== tag)
      saveTodos()
    }
  }
  
  const markAllComplete = () => {
    const now = new Date()
    filteredTodos.value.forEach(todo => {
      if (!todo.completed) {
        todo.completed = true
        todo.completedAt = now
      }
    })
    saveTodos()
  }
  
  const clearCompleted = () => {
    // Only clear completed todos from the current filter
    if (activeTag.value === 'all') {
      todos.value = todos.value.filter(todo => !todo.completed)
    } else if (activeTag.value === 'untagged') {
      todos.value = todos.value.filter(todo => !todo.completed || todo.tags.length > 0)
    } else {
      todos.value = todos.value.filter(todo => !todo.completed || !todo.tags.includes(activeTag.value))
    }
    saveTodos()
  }
  
  const deleteTag = (tagToDelete: string) => {
    // Remove the tag from all todos
    todos.value.forEach(todo => {
      todo.tags = todo.tags.filter(tag => tag !== tagToDelete)
    })
    
    // If we're currently viewing the deleted tag, switch to 'all'
    if (activeTag.value === tagToDelete) {
      activeTag.value = 'all'
    }
    
    saveTodos()
  }
  
  // Initialize store
  loadTodos()
  
  return {
    // State
    todos,
    activeTag,
    // Getters
    allTags,
    filteredTodos,
    completedCount,
    remainingCount,
    allCompleted,
    totalTodosByTag,
    // Actions
    setActiveTag,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodo,
    updateTodoTags,
    addTagToTodo,
    removeTagFromTodo,
    markAllComplete,
    clearCompleted,
    deleteTag
  }
})