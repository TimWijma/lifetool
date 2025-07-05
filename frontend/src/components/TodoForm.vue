<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from '../stores/todoStore'
import { useTodoForm } from '../composables/useTodoForm'

const todoStore = useTodoStore()
const { newTodo, newTodoTags, inputError, clearInputError, addTodo } = useTodoForm()
</script>