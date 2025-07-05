<template>
  <v-card>
    <v-card-text>
      <v-row class="text-center">
        <v-col cols="12">
          <h1>{{ formattedTime }}</h1>
        </v-col>
        <v-col cols="12">
          <v-btn @click="toggleTimer" :color="isRunning ? 'red' : 'green'">
            {{ isRunning ? 'Pause' : 'Start' }}
          </v-btn>
          <v-btn @click="resetTimer" class="ml-2">Reset</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const timeLeft = ref<number>(25 * 60) // 25 minutes in seconds
const isRunning = ref<boolean>(false)
let intervalId: number | null = null

const formattedTime = computed<string>(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleTimer = (): void => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = (): void => {
  isRunning.value = true
  intervalId = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      // Timer finished
      pauseTimer()
      // You could add notification logic here
    }
  }, 1000)
}

const pauseTimer = (): void => {
  isRunning.value = false
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

const resetTimer = (): void => {
  pauseTimer()
  timeLeft.value = 25 * 60
}

onUnmounted(() => {
  if (intervalId) {
    window.clearInterval(intervalId)
  }
})
</script>
