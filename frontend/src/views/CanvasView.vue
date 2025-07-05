<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <TodoListWindow />
        <PomodoroTimerWindow />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import TodoListWindow from '../components/TodoListWindow.vue'
  import PomodoroTimerWindow from '../components/PomodoroTimerWindow.vue'
</script>
