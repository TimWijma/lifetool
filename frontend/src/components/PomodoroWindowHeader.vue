<template>
  <div
    class="pomodoro-header"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div class="drag-handle">
      <v-icon size="small" class="drag-icon">mdi-drag</v-icon>
      <div class="header-content">
        <span class="window-title">{{ title }}</span>
        <div class="phase-indicator">
          <v-chip 
            :color="getPhaseColor(pomodoroStore.currentPhase)" 
            size="x-small" 
            variant="flat"
            class="phase-chip"
          >
            {{ getPhaseLabel(pomodoroStore.currentPhase) }}
          </v-chip>
          <span class="timer-mini">{{ pomodoroStore.formattedTime }}</span>
        </div>
      </div>
    </div>
    <div class="header-actions">
      <v-btn
        :icon="pomodoroStore.isRunning ? 'mdi-pause' : 'mdi-play'"
        size="x-small"
        variant="text"
        @click.stop="toggleTimer"
        :color="pomodoroStore.isRunning ? 'error' : 'success'"
        class="action-btn"
      ></v-btn>
      <v-btn
        icon="mdi-close"
        size="x-small"
        variant="text"
        @click="closeWindow"
        class="close-btn"
      ></v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { usePomodoroStore } from '../stores/pomodoroStore'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Pomodoro Timer'
})

const pomodoroStore = usePomodoroStore()

// Inject drag and close functions from DraggableWindow
const startDrag = inject<(event: MouseEvent | TouchEvent) => void>('startDrag')!
const closeWindow = inject<(event: Event) => void>('closeWindow')!

const toggleTimer = (): void => {
  pomodoroStore.toggleTimer()
}

const getPhaseLabel = (phase: string): string => {
  switch (phase) {
    case 'work':
      return 'Work'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
    default:
      return 'Work'
  }
}

const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'work':
      return 'primary'
    case 'shortBreak':
      return 'success'
    case 'longBreak':
      return 'info'
    default:
      return 'primary'
  }
}
</script>

<style scoped>
.pomodoro-header {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 12px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

.drag-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.drag-icon {
  color: #666;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.window-title {
  font-weight: 500;
  color: #333;
  font-size: 14px;
  line-height: 1.2;
}

.phase-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.phase-chip {
  font-size: 10px;
  height: 18px;
}

.timer-mini {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  font-family: monospace;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  color: #666;
  opacity: 0.8;
}

.action-btn:hover {
  opacity: 1;
}

.close-btn {
  color: #666;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
  color: #f44336;
}

.pomodoro-header:hover {
  background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
}

.pomodoro-header:active {
  background: linear-gradient(135deg, #e0e0e0 0%, #d5d5d5 100%);
}
</style>