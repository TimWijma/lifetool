<template>
    <div class="window-header" @mousedown="startDrag" @touchstart="startDrag">
        <div class="drag-handle">
            <v-icon size="small" class="drag-icon">mdi-drag</v-icon>
            <span class="window-title">{{ title }}</span>
        </div>
        <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            @click="closeWindow"
            class="close-btn"></v-btn>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";

interface Props {
    title?: string;
}

withDefaults(defineProps<Props>(), {
    title: "Window",
});

// Inject drag and close functions from DraggableWindow
const startDrag =
    inject<(event: MouseEvent | TouchEvent) => void>("startDrag")!;
const closeWindow = inject<(event: Event) => void>("closeWindow")!;
</script>

<style scoped>
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

.window-header:hover {
    background: #eeeeee;
}

.window-header:active {
    background: #e0e0e0;
}
</style>
