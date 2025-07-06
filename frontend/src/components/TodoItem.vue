<template>
    <v-list-item class="px-0 todo-item" :class="{ 'completed-todo': todo.completed }">
        <template v-slot:prepend>
            <v-checkbox
                :model-value="todo.completed"
                color="primary"
                hide-details
                @update:model-value="$emit('toggle')"
                :aria-label="`Mark '${todo.text}' as ${
                    todo.completed ? 'incomplete' : 'complete'
                }`"></v-checkbox>
        </template>

        <v-list-item-title class="todo-content">
            <!-- Todo text and tags inline -->
            <div class="todo-main-row">
                <span v-if="!todo.isEditing" class="todo-name">{{ todo.text }}</span>
                <v-text-field
                    v-else
                    v-model="todo.editText"
                    @keyup.enter="saveTodoEdit(todo.id)"
                    @keyup.escape="cancelTodoEdit(todo.id)"
                    @blur="saveTodoEdit(todo.id)"
                    hide-details
                    density="compact"
                    autofocus
                    class="edit-input"></v-text-field>

                <!-- Tags inline with title -->
                <div v-if="!todo.isEditing" class="tags-inline">
                    <!-- Existing tags -->
                    <v-chip
                        v-for="tag in todo.tags"
                        :key="tag"
                        size="x-small"
                        color="primary"
                        variant="outlined"
                        @click="$emit('tag-click', tag)"
                        class="tag-chip">
                        {{ tag }}
                        <template v-slot:append>
                            <v-icon size="x-small" @click.stop="removeTagFromTodo(todo.id, tag)">
                                mdi-close
                            </v-icon>
                        </template>
                    </v-chip>

                    <!-- Add tag menu -->
                    <v-menu
                        :model-value="openMenus.has(todo.id)"
                        @update:model-value="(value: boolean) => toggleMenu(todo.id, value)"
                        location="bottom start">
                        <template v-slot:activator="{ props }">
                            <v-chip
                                v-bind="props"
                                size="x-small"
                                variant="tonal"
                                color="grey"
                                class="add-tag-chip">
                                <v-icon size="x-small">mdi-plus</v-icon>
                                Tag
                            </v-chip>
                        </template>
                        <v-card min-width="200">
                            <v-list density="compact">
                                <v-list-item
                                    v-for="availableTag in todoStore.allTags.filter(
                                        (t) => !todo.tags.includes(t)
                                    )"
                                    :key="availableTag"
                                    @click="addTagToTodo(todo.id, availableTag)"
                                    class="tag-option">
                                    <v-list-item-title>{{ availableTag }}</v-list-item-title>
                                </v-list-item>
                                <v-divider
                                    v-if="
                                        todoStore.allTags.filter((t) => !todo.tags.includes(t))
                                            .length > 0
                                    "></v-divider>
                                <v-list-item>
                                    <v-text-field
                                        v-model="newTagForTodo"
                                        label="New tag"
                                        density="compact"
                                        @keyup.enter="addNewTagToTodo(todo.id)"
                                        @click.stop
                                        @mousedown.stop
                                        hide-details
                                        autofocus></v-text-field>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-menu>
                </div>
            </div>
        </v-list-item-title>

        <v-list-item-subtitle v-if="todo.createdAt" class="text-caption mt-1">
            <v-icon size="x-small" class="mr-1">mdi-calendar-plus</v-icon>
            {{ formatDate(todo.createdAt) }}
            <span v-if="todo.completedAt">
                <v-icon size="x-small" class="ml-2 mr-1">mdi-check-circle</v-icon>
                {{ formatDate(todo.completedAt) }}
            </span>
        </v-list-item-subtitle>

        <template v-slot:append>
            <!-- Actions menu -->
            <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-dots-vertical"
                        size="small"
                        variant="text"
                        :aria-label="`Actions for todo: ${todo.text}`"></v-btn>
                </template>
                <v-list density="compact" min-width="120">
                    <v-list-item
                        v-if="!todo.isEditing"
                        @click="startTodoEdit(todo.id)"
                        prepend-icon="mdi-pencil">
                        <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        @click="$emit('delete')"
                        prepend-icon="mdi-delete"
                        class="text-error">
                        <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
import type { Todo } from "../stores/todoStore";
import { useTodoStore } from "../stores/todoStore";
import { useTodoEdit } from "../composables/useTodoEdit";
import { useTodoTags } from "../composables/useTodoTags";

interface Props {
    todo: Todo;
}

defineProps<Props>();

defineEmits<{
    toggle: [];
    delete: [];
    "tag-click": [tag: string];
}>();

const todoStore = useTodoStore();
const { startTodoEdit, saveTodoEdit, cancelTodoEdit } = useTodoEdit();
const { openMenus, newTagForTodo, addTagToTodo, removeTagFromTodo, addNewTagToTodo, toggleMenu } =
    useTodoTags();

const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
};
</script>

<style scoped>
.todo-item {
    transition: all 0.2s ease;
    border-radius: 4px;
    padding: 8px 0;
}

.todo-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.completed-todo {
    opacity: 0.7;
}

.completed-todo .todo-name {
    text-decoration: line-through;
    color: rgba(0, 0, 0, 0.6);
}

.todo-content {
    flex-direction: column;
    align-items: flex-start !important;
}

.todo-main-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    flex-wrap: wrap;
}

.todo-name {
    font-size: 0.95rem;
    line-height: 1.4;
    word-wrap: break-word;
    flex-shrink: 0;
}

.edit-input {
    flex: 1;
    max-width: 300px;
}

.tags-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
}

.tag-option:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

@media (max-width: 600px) {
    .todo-main-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .tags-inline {
        margin-left: 0;
    }
}
</style>
