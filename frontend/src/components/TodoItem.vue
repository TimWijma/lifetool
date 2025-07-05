<template>
  <v-list-item
    class="px-0 todo-item"
    :class="{ 'completed-todo': todo.completed }"
  >
    <template v-slot:prepend>
      <v-checkbox
        :model-value="todo.completed"
        color="primary"
        hide-details
        @update:model-value="$emit('toggle')"
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
            @click="$emit('tag-click', tag)"
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
        @click="$emit('delete')"
        :aria-label="`Delete todo: ${todo.text}`"
        color="error"
      ></v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { Todo } from '../stores/todoStore'
import { useTodoStore } from '../stores/todoStore'
import { useTodoEdit } from '../composables/useTodoEdit'
import { useTodoTags } from '../composables/useTodoTags'

interface Props {
  todo: Todo
}

defineProps<Props>()

defineEmits<{
  toggle: []
  delete: []
  'tag-click': [tag: string]
}>()

const todoStore = useTodoStore()
const { startTodoEdit, saveTodoEdit, cancelTodoEdit } = useTodoEdit()
const { openMenus, newTagForTodo, addTagToTodo, removeTagFromTodo, addNewTagToTodo, toggleMenu } = useTodoTags()

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