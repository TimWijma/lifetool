import { useTodoStore } from '../stores/todoStore'

export function useTodoEdit() {
  const todoStore = useTodoStore()

  const startTodoEdit = (id: string): void => {
    const todo = todoStore.filteredTodos.find(t => t.id === id)
    if (todo) {
      todo.isEditing = true
      todo.editText = todo.text
    }
  }

  const saveTodoEdit = (id: string): void => {
    const todo = todoStore.filteredTodos.find(t => t.id === id)
    if (todo && todo.editText?.trim()) {
      todoStore.updateTodo(id, todo.editText)
    }
    if (todo) {
      todo.isEditing = false
      delete todo.editText
    }
  }

  const cancelTodoEdit = (id: string): void => {
    const todo = todoStore.filteredTodos.find(t => t.id === id)
    if (todo) {
      todo.isEditing = false
      delete todo.editText
    }
  }

  return {
    startTodoEdit,
    saveTodoEdit,
    cancelTodoEdit
  }
}