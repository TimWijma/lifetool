<template>
  <div class="canvas-container">
    <!-- Simple floating action buttons with state indicators -->
    <div class="fab-container">
      <v-btn
        v-for="(config, type) in WINDOW_CONFIGS"
        :key="type"
        :icon="config.icon"
        :color="getWindow(type)?.isVisible ? 'success' : 'primary'"
        :variant="getWindow(type)?.isVisible ? 'elevated' : 'outlined'"
        size="large"
        class="mb-2"
        @click="toggleWindow(type)"
      ></v-btn>
    </div>

    <!-- Debug info -->
    <div class="debug-info">
      Windows: P:{{ getWindow(WindowType.POMODORO)?.isVisible ? 'ON' : 'OFF' }} | T:{{ getWindow(WindowType.TODO)?.isVisible ? 'ON' : 'OFF' }}
    </div>

    <DraggableWindow
      v-for="windowInstance in visibleWindows"
      :key="windowInstance.id"
      :title="windowInstance.title"
      :x="windowInstance.x"
      :y="windowInstance.y"
      :width="windowInstance.width"
      :height="windowInstance.height"
      :z-index="windowInstance.zIndex"
      :min-width="WINDOW_CONFIGS[windowInstance.type].minWidth"
      :min-height="WINDOW_CONFIGS[windowInstance.type].minHeight"
      @bring-to-front="bringToFront(windowInstance.type)"
      @position-changed="updateWindowPosition(windowInstance.type, $event)"
      @size-changed="updateWindowSize(windowInstance.type, $event)"
      @close="closeWindow(windowInstance.type)"
    >
      <component :is="getWindowComponent(windowInstance.type)" />
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted, type Component } from 'vue'
import DraggableWindow from '../components/DraggableWindow.vue'
import PomodoroTimerWindow from '../components/PomodoroTimerWindow.vue'
import TodoListWindow from '../components/TodoListWindow.vue'

enum WindowType {
  POMODORO = 'pomodoro',
  TODO = 'todo'
}

interface WindowConfig {
  title: string
  defaultX: number
  defaultY: number
  icon: string
  component: Component
  minWidth: number
  minHeight: number
  defaultWidth: number
  defaultHeight: number
}

interface WindowState {
  id: number
  type: WindowType
  title: string
  x: number
  y: number
  width: number
  height: number
  isVisible: boolean
  zIndex: number
}

const WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
  [WindowType.POMODORO]: { 
    title: 'Pomodoro Timer', 
    defaultX: 100, 
    defaultY: 100, 
    icon: 'mdi-timer',
    component: PomodoroTimerWindow,
    minWidth: 320,
    minHeight: 180,
    defaultWidth: 400,
    defaultHeight: 220
  },
  [WindowType.TODO]: { 
    title: 'Todo List', 
    defaultX: 200, 
    defaultY: 150, 
    icon: 'mdi-format-list-bulleted',
    component: TodoListWindow,
    minWidth: 350,
    minHeight: 200,
    defaultWidth: 450,
    defaultHeight: 350
  }
}

let windowIdCounter = 0
const maxZIndex = ref(100)

// Create reactive window states using Map
const windowStates = ref<Map<WindowType, WindowState>>(new Map())

// Initialize windows
const initializeWindows = () => {
  windowStates.value.set(WindowType.POMODORO, reactive({
    id: ++windowIdCounter,
    type: WindowType.POMODORO,
    title: WINDOW_CONFIGS[WindowType.POMODORO].title,
    x: WINDOW_CONFIGS[WindowType.POMODORO].defaultX,
    y: WINDOW_CONFIGS[WindowType.POMODORO].defaultY,
    width: WINDOW_CONFIGS[WindowType.POMODORO].defaultWidth,
    height: WINDOW_CONFIGS[WindowType.POMODORO].defaultHeight,
    isVisible: false,
    zIndex: maxZIndex.value++
  }))

  windowStates.value.set(WindowType.TODO, reactive({
    id: ++windowIdCounter,
    type: WindowType.TODO,
    title: WINDOW_CONFIGS[WindowType.TODO].title,
    x: WINDOW_CONFIGS[WindowType.TODO].defaultX,
    y: WINDOW_CONFIGS[WindowType.TODO].defaultY,
    width: WINDOW_CONFIGS[WindowType.TODO].defaultWidth,
    height: WINDOW_CONFIGS[WindowType.TODO].defaultHeight,
    isVisible: false,
    zIndex: maxZIndex.value++
  }))
}

// Initialize windows on setup
initializeWindows()

// Computed property to get only visible windows (memoized)
const visibleWindows = computed(() => {
  const visible: WindowState[] = []
  for (const windowState of windowStates.value.values()) {
    if (windowState.isVisible) {
      visible.push(windowState)
    }
  }
  return visible
})

const getWindow = (type: WindowType): WindowState | undefined => {
  return windowStates.value.get(type)
}

const getWindowComponent = (type: WindowType): Component => {
  return WINDOW_CONFIGS[type].component
}

const toggleWindow = (type: WindowType): void => {
  const windowState = windowStates.value.get(type)
  if (windowState) {
    windowState.isVisible = !windowState.isVisible
  }
}

const closeWindow = (type: WindowType): void => {
  const windowState = windowStates.value.get(type)
  if (windowState) {
    windowState.isVisible = false
  }
}

const updateWindowPosition = (type: WindowType, position: { x: number; y: number }): void => {
  const windowState = windowStates.value.get(type)
  if (!windowState) return

  // Apply boundary constraints using current window dimensions
  const viewportWidth = globalThis.window.innerWidth
  const viewportHeight = globalThis.window.innerHeight
  
  const maxX = Math.max(0, viewportWidth - windowState.width)
  const maxY = Math.max(0, viewportHeight - windowState.height)
  
  windowState.x = Math.max(0, Math.min(position.x, maxX))
  windowState.y = Math.max(0, Math.min(position.y, maxY))
}

const updateWindowSize = (type: WindowType, size: { width: number; height: number }): void => {
  const windowState = windowStates.value.get(type)
  if (!windowState) return

  const config = WINDOW_CONFIGS[type]
  const viewportWidth = globalThis.window.innerWidth
  const viewportHeight = globalThis.window.innerHeight
  
  // Apply minimum and maximum constraints
  windowState.width = Math.max(config.minWidth, Math.min(size.width, viewportWidth))
  windowState.height = Math.max(config.minHeight, Math.min(size.height, viewportHeight))
  
  // Ensure window doesn't go out of bounds after resize
  updateWindowPosition(type, { x: windowState.x, y: windowState.y })
}

const bringToFront = (type: WindowType): void => {
  const windowState = windowStates.value.get(type)
  if (windowState) {
    maxZIndex.value += 1
    windowState.zIndex = maxZIndex.value
  }
}

// Cleanup on unmount
onUnmounted(() => {
  windowStates.value.clear()
})
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
  z-index: 2000;
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
  z-index: 2000;
}
</style>
