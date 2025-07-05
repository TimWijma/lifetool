<template>
  <div class="todo-container">
    <!-- Add todo input -->
    <v-text-field
      v-model="newTodo"
      label="Add new todo"
      :error-messages="inputError"
      @keyup.enter="addTodo"
      append-inner-icon="mdi-plus"
      @click:append-inner="addTodo"
      @input="clearInputError"
      maxlength="200"
      counter
      clearable
    ></v-text-field>
    
    <!-- Todo statistics -->
    <v-row class="mb-3" v-if="todos.length > 0">
      <v-col cols="12">
        <v-chip-group class="justify-center">
          <v-chip color="primary" size="small">
            Total: {{ todos.length }}
          </v-chip>
          <v-chip color="success" size="small">
            Completed: {{ completedCount }}
          </v-chip>
          <v-chip color="warning" size="small">
            Remaining: {{ remainingCount }}
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Bulk actions -->
    <v-row class="mb-3" v-if="todos.length > 0">
      <v-col cols="12" class="text-center">
        <v-btn
          size="small"
          variant="outlined"
          color="success"
          @click="markAllComplete"
          :disabled="allCompleted"
          class="mr-2"
        >
          <v-icon start>mdi-check-all</v-icon>
          Complete All
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          color="warning"
          @click="clearCompleted"
          :disabled="completedCount === 0"
        >
          <v-icon start>mdi-delete-sweep</v-icon>
          Clear Completed
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- Todo list -->
    <v-list v-if="todos.length > 0" class="todo-list">
      <v-list-item
        v-for="todo in todos"
        :key="todo.id"
        class="px-0 todo-item"
        :class="{ 'completed-todo': todo.completed }"
      >
        <template v-slot:prepend>
          <v-checkbox
            v-model="todo.completed"
            color="primary"
            hide-details
            @change="onTodoToggle(todo)"
            :aria-label="`Mark '${todo.text}' as ${todo.completed ? 'incomplete' : 'complete'}`"
          ></v-checkbox>
        </template>
        
        <v-list-item-title
          :class="{ 'text-decoration-line-through': todo.completed }"
          class="todo-text"
        >
          <span v-if="!todo.isEditing">{{ todo.text }}</span>
          <v-text-field
            v-else
            v-model="todo.editText"
            @keyup.enter="saveTodoEdit(todo)"
            @keyup.escape="cancelTodoEdit(todo)"
            @blur="saveTodoEdit(todo)"
            hide-details
            density="compact"
            autofocus
          ></v-text-field>
        </v-list-item-title>
        
        <v-list-item-subtitle v-if="todo.createdAt" class="text-caption">
          Created: {{ formatDate(todo.createdAt) }}
          <span v-if="todo.completedAt"> • Completed: {{ formatDate(todo.completedAt) }}</span>
        </v-list-item-subtitle>
        
        <template v-slot:append>
          <v-btn
            v-if="!todo.isEditing"
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="startTodoEdit(todo)"
            :aria-label="`Edit todo: ${todo.text}`"
            class="mr-1"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            @click="removeTodo(todo.id)"
            :aria-label="`Delete todo: ${todo.text}`"
            color="error"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <!-- Empty state -->
    <v-card v-else class="text-center pa-6" variant="outlined">
      <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-format-list-bulleted</v-icon>
      <h3 class="text-h6 mb-2">No todos yet</h3>
      <p class="text-body-2 text-grey">Add your first todo item above to get started!</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  isEditing?: boolean
  editText?: string
}

const newTodo = ref<string>('')
const todos = ref<Todo[]>([])
const inputError = ref<string>('')

// Computed properties
const completedCount = computed(() => todos.value.filter(todo => todo.completed).length)
const remainingCount = computed(() => todos.value.filter(todo => !todo.completed).length)
const allCompleted = computed(() => todos.value.length > 0 && completedCount.value === todos.value.length)

// Local storage key
const STORAGE_KEY = 'lifetool-todos'

// Load todos from localStorage on mount
onMounted(() => {
  loadTodos()
})

// Watch todos and save to localStorage
watch(todos, () => {
  saveTodos()
}, { deep: true })

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const validateTodo = (text: string): string => {
  const trimmed = text.trim()
  if (!trimmed) {
    return 'Todo cannot be empty'
  }
  if (trimmed.length > 200) {
    return 'Todo cannot exceed 200 characters'
  }
  if (todos.value.some(todo => todo.text.toLowerCase() === trimmed.toLowerCase())) {
    return 'This todo already exists'
  }
  return ''
}

const clearInputError = (): void => {
  inputError.value = ''
}

const addTodo = (): void => {
  const error = validateTodo(newTodo.value)
  if (error) {
    inputError.value = error
    return
  }

  todos.value.push({
    id: generateId(),
    text: newTodo.value.trim(),
    completed: false,
    createdAt: new Date()
  })
  newTodo.value = ''
  inputError.value = ''
}

const removeTodo = (id: string): void => {
  const index = todos.value.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos.value.splice(index, 1)
  }
}

const onTodoToggle = (todo: Todo): void => {
  if (todo.completed) {
    todo.completedAt = new Date()
  } else {
    delete todo.completedAt
  }
}

const startTodoEdit = (todo: Todo): void => {
  todo.isEditing = true
  todo.editText = todo.text
}

const saveTodoEdit = (todo: Todo): void => {
  if (todo.editText?.trim()) {
    todo.text = todo.editText.trim()
  }
  todo.isEditing = false
  delete todo.editText
}

const cancelTodoEdit = (todo: Todo): void => {
  todo.isEditing = false
  delete todo.editText
}

const markAllComplete = (): void => {
  const now = new Date()
  todos.value.forEach(todo => {
    if (!todo.completed) {
      todo.completed = true
      todo.completedAt = now
    }
  })
}

const clearCompleted = (): void => {
  todos.value = todos.value.filter(todo => !todo.completed)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const saveTodos = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
  } catch (error) {
    console.warn('Failed to save todos to localStorage:', error)
  }
}

const loadTodos = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
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
</script>

<style scoped>
.todo-container {
  max-height: 400px;
  overflow-y: auto;
}

.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  transition: all 0.2s ease;
  border-radius: 4px;
  margin-bottom: 4px;
}

.todo-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.completed-todo {
  opacity: 0.7;
}

.completed-todo .todo-text {
  color: rgba(0, 0, 0, 0.6);
}

@keyframes completion-celebration {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.todo-item.just-completed {
  animation: completion-celebration 0.3s ease;
}
</style>
