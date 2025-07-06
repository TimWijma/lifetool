<template>
    <div class="todo-header" @mousedown="startDrag" @touchstart="startDrag">
        <div class="drag-handle">
            <v-icon size="small" class="drag-icon">mdi-drag</v-icon>
            <div class="header-content">
                <span class="window-title">{{ title }}</span>
                <div class="stats-indicator">
                    <v-chip
                        v-if="todoStore.activeTag !== 'all'"
                        :color="
                            todoStore.activeTag === 'untagged'
                                ? 'grey'
                                : 'primary'
                        "
                        size="x-small"
                        variant="outlined"
                        class="tag-chip">
                        {{
                            todoStore.activeTag === "untagged"
                                ? "Untagged"
                                : todoStore.activeTag
                        }}
                    </v-chip>
                    <span class="stats-mini"
                        >{{ todoStore.remainingCount }}/{{
                            todoStore.filteredTodos.length
                        }}</span
                    >
                </div>
            </div>
        </div>
        <div class="header-actions">
            <v-btn
                v-if="todoStore.remainingCount > 0"
                icon="mdi-plus"
                size="x-small"
                variant="text"
                @click.stop="focusAddTodo"
                color="primary"
                class="action-btn">
                <v-tooltip activator="parent" location="bottom"
                    >Add Todo</v-tooltip
                >
            </v-btn>
            <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                @click="closeWindow"
                class="close-btn"></v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { useTodoStore } from "../stores/todoStore";

interface Props {
    title?: string;
}

withDefaults(defineProps<Props>(), {
    title: "Todo List",
});

const todoStore = useTodoStore();

// Inject drag and close functions from DraggableWindow
const startDrag =
    inject<(event: MouseEvent | TouchEvent) => void>("startDrag")!;
const closeWindow = inject<(event: Event) => void>("closeWindow")!;

const focusAddTodo = (): void => {
    // Try to focus the todo input field
    const todoInput = document.querySelector(
        '.todo-container input[type="text"]'
    ) as HTMLInputElement;
    if (todoInput) {
        todoInput.focus();
    }
};
</script>

<style scoped>
.todo-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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

.stats-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tag-chip {
    font-size: 10px;
    height: 18px;
}

.stats-mini {
    font-size: 11px;
    color: #666;
    font-weight: 500;
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

.todo-header:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.todo-header:active {
    background: linear-gradient(135deg, #dee2e6 0%, #ced4da 100%);
}
</style>
