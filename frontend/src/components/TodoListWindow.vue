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
    
    <!-- Todo statistics and bulk actions bar -->
    <div v-if="todoStore.filteredTodos.length > 0" class="stats-bar mb-3">
      <div class="stats-chips">
        <v-chip color="primary" size="x-small" variant="outlined">
          {{ todoStore.filteredTodos.length }} total
        </v-chip>
        <v-chip color="success" size="x-small" variant="outlined">
          {{ todoStore.completedCount }} done
        </v-chip>
        <v-chip color="warning" size="x-small" variant="outlined">
          {{ todoStore.remainingCount }} left
        </v-chip>
      </div>
      
      <div class="bulk-actions">
        <v-tooltip text="Complete All" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-check-all"
              size="x-small"
              variant="text"
              color="success"
              @click="markAllComplete"
              :disabled="todoStore.allCompleted"
            ></v-btn>
          </template>
        </v-tooltip>
        
        <v-tooltip text="Clear Completed" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-delete-sweep"
              size="x-small"
              variant="text"
              color="warning"
              @click="clearCompleted"
              :disabled="todoStore.completedCount === 0"
            ></v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
    
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

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.stats-chips {
  display: flex;
  gap: 6px;
  align-items: center;
}

.bulk-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
