<template>
  <div
    class="draggable-window"
    :style="{
      left: x + 'px',
      top: y + 'px',
      zIndex: zIndex,
      width: width + 'px',
      height: height + 'px'
    }"
    @mousedown="emit('bring-to-front')"
  >
    <!-- Custom header slot with fallback to default -->
    <slot name="header" :title="title" :startDrag="startDrag" :closeWindow="closeWindow">
      <WindowHeader :title="title" />
    </slot>
    
    <div class="window-content">
      <slot></slot>
    </div>
    
    <!-- Resize Handle -->
    <div
      class="resize-handle"
      @mousedown="startResize"
      @touchstart="startResize"
    >
      <v-icon size="small" class="resize-icon">mdi-resize-bottom-right</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onUnmounted, provide } from 'vue'
import { safeLocalStorageOperation } from '../utils/errorHandler'
import WindowHeader from './WindowHeader.vue'

interface Props {
  title?: string
  x: number
  y: number
  zIndex: number
  minWidth?: number
  minHeight?: number
  width: number
  height: number
}

interface DragState {
  isDragging: boolean
  offsetX: number
  offsetY: number
}

interface ResizeState {
  isResizing: boolean
  startWidth: number
  startHeight: number
  startX: number
  startY: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Window',
  minWidth: 200,
  minHeight: 100,
  width: 400,
  height: 300
})

const emit = defineEmits<{
  'bring-to-front': []
  'position-changed': [position: { x: number; y: number }]
  'size-changed': [size: { width: number; height: number }]
  'close': []
}>()

const dragState = reactive<DragState>({ isDragging: false, offsetX: 0, offsetY: 0 })
const resizeState = reactive<ResizeState>({ 
  isResizing: false, 
  startWidth: 0, 
  startHeight: 0, 
  startX: 0, 
  startY: 0 
})

// Utility function to extract coordinates from mouse/touch events
const getEventCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
  return safeLocalStorageOperation(
    () => {
      if (event.type.startsWith('touch')) {
        const touchEvent = event as TouchEvent
        if (touchEvent.touches.length === 0) {
          return { x: 0, y: 0 }
        }
        return { x: touchEvent.touches[0].clientX, y: touchEvent.touches[0].clientY }
      }
      const mouseEvent = event as MouseEvent
      return { x: mouseEvent.clientX, y: mouseEvent.clientY }
    },
    { x: 0, y: 0 },
    'extracting event coordinates'
  )
}

// Cleanup function for event listeners
const cleanupEventListeners = () => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag as EventListener)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize as EventListener)
  document.removeEventListener('touchend', stopResize)
}

const startDrag = (event: MouseEvent | TouchEvent): void => {
  event.preventDefault()
  event.stopPropagation()
  
  emit('bring-to-front')
  
  dragState.isDragging = true
  
  const { x: clientX, y: clientY } = getEventCoordinates(event)
  
  dragState.offsetX = clientX - props.x
  dragState.offsetY = clientY - props.y
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag as EventListener, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

const handleDrag = (event: MouseEvent | TouchEvent): void => {
  if (!dragState.isDragging) return
  
  event.preventDefault()
  
  const { x: clientX, y: clientY } = getEventCoordinates(event)
  
  const newX = clientX - dragState.offsetX
  const newY = clientY - dragState.offsetY
  
  emit('position-changed', { x: newX, y: newY })
}

const stopDrag = (): void => {
  if (!dragState.isDragging) return
  
  dragState.isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag as EventListener)
  document.removeEventListener('touchend', stopDrag)
}

const closeWindow = (event: Event): void => {
  event.stopPropagation()
  emit('close')
}

const startResize = (event: MouseEvent | TouchEvent): void => {
  event.preventDefault()
  event.stopPropagation()
  
  emit('bring-to-front')
  
  resizeState.isResizing = true
  resizeState.startWidth = props.width
  resizeState.startHeight = props.height
  
  const { x: clientX, y: clientY } = getEventCoordinates(event)
  
  resizeState.startX = clientX
  resizeState.startY = clientY
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', handleResize as EventListener, { passive: false })
  document.addEventListener('touchend', stopResize)
}

const handleResize = (event: MouseEvent | TouchEvent): void => {
  if (!resizeState.isResizing) return
  
  event.preventDefault()
  
  const { x: clientX, y: clientY } = getEventCoordinates(event)
  
  const deltaX = clientX - resizeState.startX
  const deltaY = clientY - resizeState.startY
  
  const newWidth = Math.max(props.minWidth, resizeState.startWidth + deltaX)
  const newHeight = Math.max(props.minHeight, resizeState.startHeight + deltaY)
  
  const viewportWidth = globalThis.window.innerWidth
  const viewportHeight = globalThis.window.innerHeight
  
  const maxWidth = Math.min(newWidth, viewportWidth)
  const maxHeight = Math.min(newHeight, viewportHeight)

  emit('size-changed', { width: maxWidth, height: maxHeight })
}

const stopResize = (): void => {
  if (!resizeState.isResizing) return
  
  resizeState.isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize as EventListener)
  document.removeEventListener('touchend', stopResize)
}

// Provide drag and close functions for custom headers
provide('startDrag', startDrag)
provide('closeWindow', closeWindow)

onUnmounted(() => {
  cleanupEventListeners()
})
</script>

<style scoped>
.draggable-window {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: v-bind('props.minWidth + "px"');
  min-height: v-bind('props.minHeight + "px"');
  user-select: none;
}

.window-header {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 12px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.window-title {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.close-btn {
  color: #666;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
  color: #f44336;
}

.window-content {
  padding: 16px;
}

.window-header:hover {
  background: #eeeeee;
}

.window-header:active {
  background: #e0e0e0;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 0 8px 0;
  opacity: 0.6;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.resize-handle:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.15);
}

.resize-icon {
  color: #666;
  transform: rotate(0deg);
}
</style>