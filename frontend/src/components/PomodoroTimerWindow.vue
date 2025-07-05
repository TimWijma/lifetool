<template>
  <v-row class="text-center">
    <v-col cols="12">
      <v-chip 
        :color="currentPhase === 'work' ? 'primary' : 'success'" 
        class="mb-2"
        size="small"
      >
        {{ currentPhase === 'work' ? 'Work Time' : 'Break Time' }}
      </v-chip>
      <h1 
        :class="{ 'timer-warning': timeLeft <= 60 && isRunning }"
        role="timer"
        :aria-label="`${currentPhase === 'work' ? 'Work' : 'Break'} timer: ${formattedTime} remaining`"
      >
        {{ formattedTime }}
      </h1>
      <v-progress-linear
        :model-value="progressPercentage"
        :color="currentPhase === 'work' ? 'primary' : 'success'"
        height="6"
        class="mb-3"
      ></v-progress-linear>
    </v-col>
    <v-col cols="12">
      <v-btn 
        @click="toggleTimer" 
        :color="isRunning ? 'error' : 'success'"
        :disabled="timeLeft === 0"
        size="large"
        class="mr-2"
      >
        <v-icon start>{{ isRunning ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        {{ isRunning ? 'Pause' : (timeLeft === initialDuration ? 'Start' : 'Resume') }}
      </v-btn>
      <v-btn 
        @click="resetTimer" 
        color="secondary"
        variant="outlined"
        size="large"
        class="mr-2"
      >
        <v-icon start>mdi-restart</v-icon>
        Reset
      </v-btn>
      <v-btn 
        @click="skipPhase"
        color="warning"
        variant="outlined"
        size="large"
        :disabled="!isRunning && timeLeft === initialDuration"
      >
        <v-icon start>mdi-skip-next</v-icon>
        Skip
      </v-btn>
    </v-col>
    <v-col cols="12">
      <v-chip-group class="justify-center">
        <v-chip 
          v-for="i in completedCycles" 
          :key="i"
          color="success"
          size="small"
        >
          {{ i }}
        </v-chip>
      </v-chip-group>
      <p class="text-caption mt-2">Completed Pomodoros: {{ completedCycles }}</p>
    </v-col>
  </v-row>

  <!-- Timer completion dialog -->
  <v-dialog v-model="showCompletionDialog" max-width="300" persistent>
    <v-card>
      <v-card-title class="text-center">
        <v-icon large :color="lastCompletedPhase === 'work' ? 'success' : 'primary'">
          {{ lastCompletedPhase === 'work' ? 'mdi-check-circle' : 'mdi-coffee' }}
        </v-icon>
      </v-card-title>
      <v-card-text class="text-center">
        <h3>{{ lastCompletedPhase === 'work' ? 'Work session complete!' : 'Break time over!' }}</h3>
        <p>{{ lastCompletedPhase === 'work' ? 'Time for a break!' : 'Ready to get back to work?' }}</p>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="startNextPhase">
          Start {{ currentPhase === 'work' ? 'Work' : 'Break' }}
        </v-btn>
        <v-btn variant="outlined" @click="dismissDialog">
          Dismiss
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// Constants
const WORK_DURATION = 25 * 60 // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60 // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60 // 15 minutes in seconds
const CYCLES_BEFORE_LONG_BREAK = 4

type TimerPhase = 'work' | 'shortBreak' | 'longBreak'

// State
const timeLeft = ref<number>(WORK_DURATION)
const isRunning = ref<boolean>(false)
const currentPhase = ref<TimerPhase>('work')
const completedCycles = ref<number>(0)
const showCompletionDialog = ref<boolean>(false)
const lastCompletedPhase = ref<TimerPhase>('work')

let intervalId: ReturnType<typeof setInterval> | null = null

// Computed properties
const initialDuration = computed<number>(() => {
  switch (currentPhase.value) {
    case 'work':
      return WORK_DURATION
    case 'shortBreak':
      return SHORT_BREAK_DURATION
    case 'longBreak':
      return LONG_BREAK_DURATION
    default:
      return WORK_DURATION
  }
})

const formattedTime = computed<string>(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progressPercentage = computed<number>(() => {
  return ((initialDuration.value - timeLeft.value) / initialDuration.value) * 100
})

// Timer functions
const toggleTimer = (): void => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = (): void => {
  isRunning.value = true
  intervalId = globalThis.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completePhase()
    }
  }, 1000)
}

const pauseTimer = (): void => {
  isRunning.value = false
  if (intervalId) {
    globalThis.clearInterval(intervalId)
    intervalId = null
  }
}

const resetTimer = (): void => {
  pauseTimer()
  timeLeft.value = initialDuration.value
}

const completePhase = (): void => {
  pauseTimer()
  lastCompletedPhase.value = currentPhase.value
  
  if (currentPhase.value === 'work') {
    completedCycles.value++
    // Determine next break type
    if (completedCycles.value % CYCLES_BEFORE_LONG_BREAK === 0) {
      currentPhase.value = 'longBreak'
    } else {
      currentPhase.value = 'shortBreak'
    }
  } else {
    // Break completed, back to work
    currentPhase.value = 'work'
  }
  
  timeLeft.value = initialDuration.value
  showCompletionDialog.value = true
  
  // Play notification sound (if supported)
  playNotificationSound()
}

const skipPhase = (): void => {
  pauseTimer()
  completePhase()
}

const startNextPhase = (): void => {
  showCompletionDialog.value = false
  startTimer()
}

const dismissDialog = (): void => {
  showCompletionDialog.value = false
}

const playNotificationSound = (): void => {
  try {
    // Create a simple beep sound using Web Audio API
    const AudioContextClass = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext
    if (!AudioContextClass) return
    
    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    // Fallback: just log if audio is not supported
    console.log('Timer completed!')
  }
}

// Cleanup
onUnmounted(() => {
  if (intervalId) {
    globalThis.clearInterval(intervalId)
  }
})
</script>

<style scoped>
.timer-warning {
  color: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
