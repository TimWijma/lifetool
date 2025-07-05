import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

export function useTodoTags() {
  const todoStore = useTodoStore()
  
  const openMenus = ref<Set<string>>(new Set())
  const newTagForTodo = ref<string>('')

  const addTagToTodo = (todoId: string, tag: string): void => {
    todoStore.addTagToTodo(todoId, tag)
    openMenus.value.delete(todoId)
  }

  const removeTagFromTodo = (todoId: string, tag: string): void => {
    todoStore.removeTagFromTodo(todoId, tag)
  }

  const addNewTagToTodo = (todoId: string): void => {
    if (newTagForTodo.value.trim()) {
      todoStore.addTagToTodo(todoId, newTagForTodo.value.trim())
      newTagForTodo.value = ''
      openMenus.value.delete(todoId)
    }
  }

  const toggleMenu = (todoId: string, isOpen: boolean): void => {
    if (isOpen) {
      openMenus.value.add(todoId)
    } else {
      openMenus.value.delete(todoId)
    }
  }

  return {
    openMenus,
    newTagForTodo,
    addTagToTodo,
    removeTagFromTodo,
    addNewTagToTodo,
    toggleMenu
  }
}