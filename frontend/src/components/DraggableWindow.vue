<template>
  <div
    ref="windowRef"
    class="draggable-window"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      zIndex: zIndex
    }"
    @mousedown="bringToFront"
  >
    <div
      class="window-header"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="drag-handle">
        <v-icon size="small" class="drag-icon">mdi-drag</v-icon>
        <span class="window-title">{{ title }}</span>
      </div>
    </div>
    <div class="window-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

interface Props {
  title?: string
  initialX?: number
  initialY?: number
}

interface Position {
  x: number
  y: number
}

interface DragOffset {
  x: number
  y: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Window',
  initialX: 100,
  initialY: 100
})

const emit = defineEmits<{
  'bring-to-front': []
  'position-changed': [position: { x: number; y: number }]
}>()

const windowRef = ref<HTMLElement | null>(null)
const isDragging = ref<boolean>(false)
const dragOffset = reactive<DragOffset>({ x: 0, y: 0 })
const position = reactive<Position>({ x: props.initialX, y: props.initialY })
const zIndex = ref<number>(1000)

let maxZIndex = 1000

const startDrag = (event: MouseEvent | TouchEvent): void => {
  event.preventDefault()
  isDragging.value = true
  
  const clientX = event.type === 'touchstart' ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX
  const clientY = event.type === 'touchstart' ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY
  
  dragOffset.x = clientX - position.x
  dragOffset.y = clientY - position.y
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDrag)
}

const handleDrag = (event: MouseEvent | TouchEvent): void => {
  if (!isDragging.value) return
  
  event.preventDefault()
  
  const clientX = event.type === 'touchmove' ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX
  const clientY = event.type === 'touchmove' ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY
  
  let newX = clientX - dragOffset.x
  let newY = clientY - dragOffset.y
  
  // Boundary constraints - keep window on screen
  const windowRect = windowRef.value?.getBoundingClientRect()
  if (windowRect) {
    const maxX = window.innerWidth - windowRect.width
    const maxY = window.innerHeight - windowRect.height
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
  }
  
  position.x = newX
  position.y = newY
}

const stopDrag = (): void => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
  
  // Emit position change to parent
  emit('position-changed', { x: position.x, y: position.y })
}

const bringToFront = (): void => {
  maxZIndex += 1
  zIndex.value = maxZIndex
  emit('bring-to-front')
}

onMounted(() => {
  // Ensure window is within bounds on mount
  const windowRect = windowRef.value?.getBoundingClientRect()
  if (windowRect) {
    const maxX = window.innerWidth - windowRect.width
    const maxY = window.innerHeight - windowRect.height
    
    position.x = Math.max(0, Math.min(position.x, maxX))
    position.y = Math.max(0, Math.min(position.y, maxY))
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.draggable-window {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 200px;
  user-select: none;
}

.window-header {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 12px;
  cursor: move;
  display: flex;
  align-items: center;
}

.drag-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.drag-icon {
  color: #666;
}

.window-title {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.window-content {
  padding: 0;
}

.window-header:hover {
  background: #eeeeee;
}

.window-header:active {
  background: #e0e0e0;
}
</style>