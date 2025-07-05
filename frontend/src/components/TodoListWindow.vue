<template>
  <div class="todo-container">
    <!-- Tag filter tabs -->
    <v-tabs 
      v-model="todoStore.activeTag" 
      @update:model-value="handleTagChange"
      density="compact"
      class="mb-3"
      show-arrows
    >
      <v-tab value="all" class="text-none">
        All
        <v-chip 
          size="x-small" 
          class="ml-1" 
          :text="todoStore.totalTodosByTag.all?.total.toString() || '0'"
        ></v-chip>
      </v-tab>
      
      <v-tab value="untagged" class="text-none" v-if="todoStore.totalTodosByTag.untagged?.total > 0">
        Untagged
        <v-chip 
          size="x-small" 
          class="ml-1" 
          :text="todoStore.totalTodosByTag.untagged?.total.toString() || '0'"
        ></v-chip>
      </v-tab>
      
      <v-tab 
        v-for="tag in todoStore.allTags" 
        :key="tag" 
        :value="tag"
        class="text-none"
      >
        {{ tag }}
        <v-chip 
          size="x-small" 
          class="ml-1" 
          :text="todoStore.totalTodosByTag[tag]?.total.toString() || '0'"
        ></v-chip>
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="ml-1"
          @click.stop="deleteTag(tag)"
          :aria-label="`Delete tag ${tag}`"
        ></v-btn>
      </v-tab>
    </v-tabs>

    <!-- Add todo input with tag support -->
    <v-row class="mb-3">
      <v-col cols="8">
        <v-text-field
          v-model="newTodo"
          label="Add new todo"
          :error-messages="inputError"
          @keyup.enter="addTodo"
          @input="clearInputError"
          maxlength="200"
          counter
          clearable
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-combobox
          v-model="newTodoTags"
          label="Tags"
          :items="todoStore.allTags"
          multiple
          chips
          closable-chips
          density="compact"
          @keyup.enter="addTodo"
        ></v-combobox>
      </v-col>
    </v-row>
    
    <v-row class="mb-3">
      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          @click="addTodo"
          :disabled="!newTodo.trim()"
          size="small"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Todo
        </v-btn>
      </v-col>
    </v-row>
    
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
      <v-list-item
        v-for="todo in todoStore.filteredTodos"
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
          <div class="d-flex align-center flex-wrap gap-2">
            <span v-if="!todo.isEditing" class="todo-name">{{ todo.text }}</span>
            <v-text-field
              v-else
              v-model="todo.editText"
              @keyup.enter="saveTodoEdit(todo.id)"
              @keyup.escape="cancelTodoEdit(todo.id)"
              @blur="saveTodoEdit(todo.id)"
              hide-details
              density="compact"
              autofocus
              class="flex-grow-1"
            ></v-text-field>
            
            <!-- Inline tags -->
            <div v-if="!todo.isEditing" class="d-flex align-center flex-wrap gap-1">
              <!-- Existing tags -->
              <v-chip
                v-for="tag in todo.tags"
                :key="tag"
                size="x-small"
                color="primary"
                variant="outlined"
                @click="todoStore.setActiveTag(tag)"
                style="cursor: pointer;"
              >
                {{ tag }}
                <template v-slot:append>
                  <v-icon
                    size="x-small"
                    @click.stop="removeTagFromTodo(todo.id, tag)"
                  >
                    mdi-close
                  </v-icon>
                </template>
              </v-chip>
              
              <!-- Add tag to todo -->
              <v-menu 
                :model-value="openMenus.has(todo.id)"
                @update:model-value="(value: boolean) => toggleMenu(todo.id, value)"
              >
                <template v-slot:activator="{ props }">
                  <v-chip
                    v-bind="props"
                    size="x-small"
                    variant="outlined"
                    color="grey"
                    style="cursor: pointer;"
                  >
                    <v-icon size="x-small">mdi-plus</v-icon>
                    Add Tag
                  </v-chip>
                </template>
                <v-list>
                  <v-list-item
                    v-for="availableTag in todoStore.allTags.filter(t => !todo.tags.includes(t))"
                    :key="availableTag"
                    @click="addTagToTodo(todo.id, availableTag)"
                  >
                    {{ availableTag }}
                  </v-list-item>
                  <v-divider v-if="todoStore.allTags.length > 0"></v-divider>
                  <v-list-item>
                    <v-text-field
                      v-model="newTagForTodo"
                      label="New tag"
                      density="compact"
                      @keyup.enter="addNewTagToTodo(todo.id)"
                      @click.stop
                      @mousedown.stop
                      hide-details
                    ></v-text-field>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
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
import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const todoStore = useTodoStore()
const newTodo = ref<string>('')
const newTodoTags = ref<string[]>([])
const newTagForTodo = ref<string>('')
const inputError = ref<string>('')
const openMenus = ref<Set<string>>(new Set())

// Computed properties
const clearInputError = (): void => {
  inputError.value = ''
}

const addTodo = (): void => {
  try {
    todoStore.addTodo(newTodo.value, newTodoTags.value)
    newTodo.value = ''
    newTodoTags.value = []
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

const addTagToTodo = (todoId: string, tag: string): void => {
  todoStore.addTagToTodo(todoId, tag)
  // Close the menu after adding an existing tag
  openMenus.value.delete(todoId)
}

const removeTagFromTodo = (todoId: string, tag: string): void => {
  todoStore.removeTagFromTodo(todoId, tag)
}

const addNewTagToTodo = (todoId: string): void => {
  if (newTagForTodo.value.trim()) {
    todoStore.addTagToTodo(todoId, newTagForTodo.value.trim())
    newTagForTodo.value = ''
    // Close the menu after adding a new tag
    openMenus.value.delete(todoId)
  }
}

const deleteTag = (tag: string): void => {
  todoStore.deleteTag(tag)
}

const markAllComplete = (): void => {
  todoStore.markAllComplete()
}

const clearCompleted = (): void => {
  todoStore.clearCompleted()
}

const toggleMenu = (todoId: string, isOpen: boolean): void => {
  if (isOpen) {
    openMenus.value.add(todoId)
  } else {
    openMenus.value.delete(todoId)
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const handleTagChange = (value: unknown): void => {
  if (typeof value === 'string') {
    todoStore.setActiveTag(value)
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
