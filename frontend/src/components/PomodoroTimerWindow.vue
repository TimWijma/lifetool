<template>
  <v-row class="text-center">
    <v-col cols="12">
      <v-chip 
        :color="pomodoroStore.currentPhase === 'work' ? 'primary' : 'success'" 
        class="mb-2"
        size="small"
      >
        {{ pomodoroStore.currentPhase === 'work' ? 'Work Time' : 'Break Time' }}
      </v-chip>
      <h1 
        :class="{ 'timer-warning': pomodoroStore.timeLeft <= 60 && pomodoroStore.isRunning }"
        role="timer"
        :aria-label="`${pomodoroStore.currentPhase === 'work' ? 'Work' : 'Break'} timer: ${pomodoroStore.formattedTime} remaining`"
      >
        {{ pomodoroStore.formattedTime }}
      </h1>
      <v-progress-linear
        :model-value="pomodoroStore.progressPercentage"
        :color="pomodoroStore.currentPhase === 'work' ? 'primary' : 'success'"
        height="6"
        class="mb-3"
      ></v-progress-linear>
    </v-col>
    <v-col cols="12">
      <v-btn 
        @click="toggleTimer" 
        :color="pomodoroStore.isRunning ? 'error' : 'success'"
        :disabled="pomodoroStore.timeLeft === 0"
        size="large"
        class="mr-2"
      >
        <v-icon start>{{ pomodoroStore.isRunning ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        {{ pomodoroStore.isRunning ? 'Pause' : (pomodoroStore.timeLeft === pomodoroStore.initialDuration ? 'Start' : 'Resume') }}
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
        :disabled="!pomodoroStore.isRunning && pomodoroStore.timeLeft === pomodoroStore.initialDuration"
      >
        <v-icon start>mdi-skip-next</v-icon>
        Skip
      </v-btn>
    </v-col>
    <v-col cols="12">
      <v-chip-group class="justify-center">
        <v-chip 
          v-for="i in pomodoroStore.completedCycles" 
          :key="i"
          color="success"
          size="small"
        >
          {{ i }}
        </v-chip>
      </v-chip-group>
      <p class="text-caption mt-2">Completed Pomodoros: {{ pomodoroStore.completedCycles }}</p>
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
          Start {{ pomodoroStore.currentPhase === 'work' ? 'Work' : 'Break' }}
        </v-btn>
        <v-btn variant="outlined" @click="dismissDialog">
          Dismiss
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { usePomodoroStore } from '../stores/pomodoroStore'

const pomodoroStore = usePomodoroStore()

// Non-persistent UI state
const showCompletionDialog = ref<boolean>(false)
const lastCompletedPhase = ref<string>('work')

// Watch for timer completion to show dialog
watch(() => pomodoroStore.timeLeft, (newTimeLeft, oldTimeLeft) => {
  // If timer went from >0 to 0, a phase completed
  if (oldTimeLeft > 0 && newTimeLeft === pomodoroStore.initialDuration && !pomodoroStore.isRunning) {
    lastCompletedPhase.value = pomodoroStore.currentPhase === 'work' ? 'shortBreak' : 'work'
    showCompletionDialog.value = true
    playNotificationSound()
  }
})

// Timer functions that handle UI feedback
const toggleTimer = (): void => {
  pomodoroStore.toggleTimer()
}

const resetTimer = (): void => {
  pomodoroStore.resetTimer()
}

const skipPhase = (): void => {
  lastCompletedPhase.value = pomodoroStore.currentPhase
  pomodoroStore.skipPhase()
  showCompletionDialog.value = true
  playNotificationSound()
}

const startNextPhase = (): void => {
  showCompletionDialog.value = false
  pomodoroStore.startTimer()
}

const dismissDialog = (): void => {
  showCompletionDialog.value = false
}

const playNotificationSound = (): void => {
  try {
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
    console.log('Timer completed!')
  }
}

// Cleanup
onUnmounted(() => {
  pomodoroStore.cleanup()
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
