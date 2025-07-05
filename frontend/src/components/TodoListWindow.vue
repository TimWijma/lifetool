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
    <v-row class="mb-3" v-if="todoStore.todos.length > 0">
      <v-col cols="12">
        <v-chip-group class="justify-center">
          <v-chip color="primary" size="small">
            Total: {{ todoStore.todos.length }}
          </v-chip>
          <v-chip color="success" size="small">
            Completed: {{ todoStore.completedCount }}
          </v-chip>
          <v-chip color="warning" size="small">
            Remaining: {{ todoStore.remainingCount }}
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Bulk actions -->
    <v-row class="mb-3" v-if="todoStore.todos.length > 0">
      <v-col cols="12" class="text-center">
        <v-btn
          size="small"
          variant="outlined"
          color="success"
          @click="markAllComplete"
          :disabled="todoStore.allCompleted"
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
          :disabled="todoStore.completedCount === 0"
        >
          <v-icon start>mdi-delete-sweep</v-icon>
          Clear Completed
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- Todo list -->
    <v-list v-if="todoStore.todos.length > 0" class="todo-list">
      <v-list-item
        v-for="todo in todoStore.todos"
        :key="todo.id"
        class="px-0 todo-item"
        :class="{ 'completed-todo': todo.completed }"
      >
        <template v-slot:prepend>
          <v-checkbox
            :model-value="todo.completed"
            color="primary"
            hide-details
            @update:model-value="onTodoToggle(todo.id)"
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
            @keyup.enter="saveTodoEdit(todo.id)"
            @keyup.escape="cancelTodoEdit(todo.id)"
            @blur="saveTodoEdit(todo.id)"
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
            @click="startTodoEdit(todo.id)"
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
import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const todoStore = useTodoStore()
const newTodo = ref<string>('')
const inputError = ref<string>('')

// Computed properties
const clearInputError = (): void => {
  inputError.value = ''
}

const addTodo = (): void => {
  try {
    todoStore.addTodo(newTodo.value)
    newTodo.value = ''
    inputError.value = ''
  } catch (error) {
    inputError.value = error instanceof Error ? error.message : 'Failed to add todo'
  }
}

const removeTodo = (id: string): void => {
  todoStore.removeTodo(id)
}

const onTodoToggle = (id: string): void => {
  todoStore.toggleTodo(id)
}

const startTodoEdit = (id: string): void => {
  const todo = todoStore.todos.find(t => t.id === id)
  if (todo) {
    todo.isEditing = true
    todo.editText = todo.text
  }
}

const saveTodoEdit = (id: string): void => {
  const todo = todoStore.todos.find(t => t.id === id)
  if (todo && todo.editText?.trim()) {
    todoStore.updateTodo(id, todo.editText)
  }
  if (todo) {
    todo.isEditing = false
    delete todo.editText
  }
}

const cancelTodoEdit = (id: string): void => {
  const todo = todoStore.todos.find(t => t.id === id)
  if (todo) {
    todo.isEditing = false
    delete todo.editText
  }
}

const markAllComplete = (): void => {
  todoStore.markAllComplete()
}

const clearCompleted = (): void => {
  todoStore.clearCompleted()
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
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
