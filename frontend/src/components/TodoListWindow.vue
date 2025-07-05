<template>
  <v-text-field
    v-model="newTodo"
    label="Add new todo"
    @keyup.enter="addTodo"
    append-inner-icon="mdi-plus"
    @click:append-inner="addTodo"
  ></v-text-field>
  
  <v-list>
    <v-list-item
      v-for="(todo, index) in todos"
      :key="index"
      class="px-0"
    >
      <template v-slot:prepend>
        <v-checkbox
          v-model="todo.completed"
          color="primary"
          hide-details
        ></v-checkbox>
      </template>
      
      <v-list-item-title
        :class="{ 'text-decoration-line-through': todo.completed }"
      >
        {{ todo.text }}
      </v-list-item-title>
      
      <template v-slot:append>
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          @click="removeTodo(index)"
        ></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  text: string
  completed: boolean
}

const newTodo = ref<string>('')
const todos = ref<Todo[]>([])

const addTodo = (): void => {
  if (newTodo.value.trim()) {
    todos.value.push({
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (index: number): void => {
  todos.value.splice(index, 1)
}
</script>
