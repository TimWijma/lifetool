<template>
  <div class="canvas-container">
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

    <DraggableWindow
      v-for="windowInstance in windowStore.visibleWindows"
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
      <template #header v-if="WINDOW_CONFIGS[windowInstance.type].headerComponent">
        <component 
          :is="WINDOW_CONFIGS[windowInstance.type].headerComponent!" 
          :title="windowInstance.title" 
        />
      </template>
      <component :is="getWindowComponent(windowInstance.type)" />
    </DraggableWindow>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, type Component } from 'vue'
import DraggableWindow from '../components/DraggableWindow.vue'
import PomodoroTimerWindow from '../components/PomodoroTimerWindow.vue'
import TodoListWindow from '../components/TodoListWindow.vue'
import PomodoroWindowHeader from '../components/PomodoroWindowHeader.vue'
import TodoWindowHeader from '../components/TodoWindowHeader.vue'
import { useWindowStore, WindowType, type WindowConfig } from '../stores/windowStore'

const windowStore = useWindowStore()

const WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
  [WindowType.POMODORO]: { 
    title: 'Pomodoro Timer', 
    defaultX: 100, 
    defaultY: 100, 
    icon: 'mdi-timer',
    component: PomodoroTimerWindow,
    headerComponent: PomodoroWindowHeader,
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
    headerComponent: TodoWindowHeader,
    minWidth: 350,
    minHeight: 200,
    defaultWidth: 450,
    defaultHeight: 350
  }
}

// Initialize windows
Object.entries(WINDOW_CONFIGS).forEach(([type, config]) => {
  windowStore.initializeWindow(type as WindowType, config)
})

const getWindow = (type: WindowType) => {
  return windowStore.getWindow(type)
}

const getWindowComponent = (type: WindowType): Component => {
  return WINDOW_CONFIGS[type].component
}

const toggleWindow = (type: WindowType): void => {
  windowStore.toggleWindow(type)
}

const closeWindow = (type: WindowType): void => {
  windowStore.closeWindow(type)
}

const updateWindowPosition = (type: WindowType, position: { x: number; y: number }): void => {
  windowStore.updateWindowPosition(type, position)
}

const updateWindowSize = (type: WindowType, size: { width: number; height: number }): void => {
  const config = WINDOW_CONFIGS[type]
  windowStore.updateWindowSize(type, size, config)
}

const bringToFront = (type: WindowType): void => {
  windowStore.bringToFront(type)
}

// Cleanup on unmount
onUnmounted(() => {
  windowStore.cleanup()
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
</style>
