import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

export function useTodoForm() {
  const todoStore = useTodoStore()
  
  const newTodo = ref<string>('')
  const newTodoTags = ref<string[]>([])
  const inputError = ref<string>('')

  const clearInputError = (): void => {
    inputError.value = ''
  }

  const addTodo = (): void => {
    try {
      console.log('useTodoForm addTodo called with:', { text: newTodo.value, tags: newTodoTags.value }) // Debug log
      todoStore.addTodo(newTodo.value, newTodoTags.value)
      newTodo.value = ''
      newTodoTags.value = []
      inputError.value = ''
    } catch (error) {
      inputError.value = error instanceof Error ? error.message : 'Failed to add todo'
    }
  }

  return {
    newTodo,
    newTodoTags,
    inputError,
    clearInputError,
    addTodo
  }
}