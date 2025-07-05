<template>
  <div class="canvas-container">
    <!-- Simple floating action buttons with state indicators -->
    <div class="fab-container">
      <v-btn
        icon="mdi-timer"
        :color="pomodoroWindow?.isVisible ? 'success' : 'primary'"
        :variant="pomodoroWindow?.isVisible ? 'elevated' : 'outlined'"
        size="large"
        class="mb-2"
        @click="toggleWindow('pomodoro')"
      ></v-btn>
      
      <v-btn
        icon="mdi-format-list-bulleted"
        :color="todoWindow?.isVisible ? 'success' : 'secondary'"
        :variant="todoWindow?.isVisible ? 'elevated' : 'outlined'"
        size="large"
        @click="toggleWindow('todo')"
      ></v-btn>
    </div>

    <!-- Debug info -->
    <div class="debug-info">
      Windows: P:{{ pomodoroWindow?.isVisible ? 'ON' : 'OFF' }} | T:{{ todoWindow?.isVisible ? 'ON' : 'OFF' }}
    </div>

    <DraggableWindow
      v-for="window in visibleWindows"
      :key="window.id"
      :title="window.title"
      :initial-x="window.x"
      :initial-y="window.y"
      @bring-to-front="bringToFront(window.id)"
      @position-changed="updateWindowPosition(window.id, $event)"
    >
      <PomodoroTimerWindow v-if="window.type === 'pomodoro'" />
      <TodoListWindow v-else-if="window.type === 'todo'" />
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DraggableWindow from '../components/DraggableWindow.vue'
import PomodoroTimerWindow from '../components/PomodoroTimerWindow.vue'
import TodoListWindow from '../components/TodoListWindow.vue'

class Window {
  id: number
  type: 'pomodoro' | 'todo'
  title: string
  x: number
  y: number
  isVisible: boolean

  constructor(id: number, type: 'pomodoro' | 'todo', title: string, x: number = 100, y: number = 100) {
    this.id = id
    this.type = type
    this.title = title
    this.x = x
    this.y = y
    this.isVisible = false
  }

  show(): void {
    this.isVisible = true
  }

  hide(): void {
    this.isVisible = false
  }

  toggle(): void {
    this.isVisible = !this.isVisible
  }

  updatePosition(x: number, y: number): void {
    this.x = x
    this.y = y
  }
}

let windowIdCounter = 0

// Create window instances
const pomodoroWindow = ref<Window>(new Window(++windowIdCounter, 'pomodoro', 'Pomodoro Timer', 100, 100))
const todoWindow = ref<Window>(new Window(++windowIdCounter, 'todo', 'Todo List', 200, 150))

const windows = ref<Window[]>([pomodoroWindow.value, todoWindow.value])

// Computed property to get only visible windows
const visibleWindows = computed(() => {
  return windows.value.filter(window => window.isVisible)
})

const toggleWindow = (type: 'pomodoro' | 'todo'): void => {
  const window = windows.value.find(w => w.type === type)
  if (window) {
    window.toggle()
  }
}

const updateWindowPosition = (windowId: number, position: { x: number; y: number }): void => {
  const window = windows.value.find(w => w.id === windowId)
  if (window) {
    window.updatePosition(position.x, position.y)
  }
}

const bringToFront = (windowId: number): void => {
  // Find and move to end of array for z-index ordering
  const windowIndex = windows.value.findIndex(w => w.id === windowId)
  if (windowIndex !== -1) {
    const window = windows.value.splice(windowIndex, 1)[0]
    windows.value.push(window)
  }
}
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f8f9fa;
}

.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.debug-info {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
}
</style>
