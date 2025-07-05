<template>
  <div class="todo-container">
    <!-- Tag filter tabs -->
    <TodoTagTabs />

    <!-- Add todo form -->
    <TodoForm />
    
    <!-- Current view indicator -->
    <v-alert
      v-if="todoStore.activeTag !== 'all'"
      type="info"
      density="compact"
      class="mb-3"
      variant="tonal"
    >
      <template v-slot:prepend>
        <v-icon>mdi-filter</v-icon>
      </template>
      Viewing: {{ todoStore.activeTag === 'untagged' ? 'Untagged todos' : `"${todoStore.activeTag}" tag` }}
      <template v-slot:append>
        <v-btn
          size="x-small"
          variant="text"
          @click="todoStore.setActiveTag('all')"
        >
          Show All
        </v-btn>
      </template>
    </v-alert>
    
    <!-- Todo statistics -->
    <v-row class="mb-3" v-if="todoStore.filteredTodos.length > 0">
      <v-col cols="12">
        <v-chip-group class="justify-center">
          <v-chip color="primary" size="small">
            Total: {{ todoStore.filteredTodos.length }}
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
    <v-row class="mb-3" v-if="todoStore.filteredTodos.length > 0">
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
    <v-list v-if="todoStore.filteredTodos.length > 0" class="todo-list">
      <TodoItem
        v-for="todo in todoStore.filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="onTodoToggle(todo.id)"
        @delete="removeTodo(todo.id)"
        @tag-click="todoStore.setActiveTag"
      />
    </v-list>

    <!-- Empty state -->
    <v-card v-else class="text-center pa-6" variant="outlined">
      <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-format-list-bulleted</v-icon>
      <h3 class="text-h6 mb-2">
        {{ todoStore.activeTag === 'all' ? 'No todos yet' : `No todos in "${todoStore.activeTag}"` }}
      </h3>
      <p class="text-body-2 text-grey">
        {{ todoStore.activeTag === 'all' ? 'Add your first todo item above to get started!' : 'Add a todo with this tag or switch to another list.' }}
      </p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from '../stores/todoStore'
import TodoTagTabs from './TodoTagTabs.vue'
import TodoForm from './TodoForm.vue'
import TodoItem from './TodoItem.vue'

const todoStore = useTodoStore()

const removeTodo = (id: string): void => {
  todoStore.removeTodo(id)
}

const onTodoToggle = (id: string): void => {
  todoStore.toggleTodo(id)
}

const markAllComplete = (): void => {
  todoStore.markAllComplete()
}

const clearCompleted = (): void => {
  todoStore.clearCompleted()
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
</style>
