<template>
    <v-tabs
        v-model="todoStore.activeTag"
        @update:model-value="handleTagChange"
        density="compact"
        class="mb-3"
        show-arrows>
        <v-tab value="all" class="text-none">
            All
            <v-chip
                size="x-small"
                class="ml-1"
                :text="
                    todoStore.totalTodosByTag.all?.total.toString() || '0'
                "></v-chip>
        </v-tab>

        <v-tab
            value="untagged"
            class="text-none"
            v-if="todoStore.totalTodosByTag.untagged?.total > 0">
            Untagged
            <v-chip
                size="x-small"
                class="ml-1"
                :text="
                    todoStore.totalTodosByTag.untagged?.total.toString() || '0'
                "></v-chip>
        </v-tab>

        <v-tab
            v-for="tag in todoStore.allTags"
            :key="tag"
            :value="tag"
            class="text-none">
            {{ tag }}
            <v-chip
                size="x-small"
                class="ml-1"
                :text="
                    todoStore.totalTodosByTag[tag]?.total.toString() || '0'
                "></v-chip>
            <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                class="ml-1"
                @click.stop="deleteTag(tag)"
                :aria-label="`Delete tag ${tag}`"></v-btn>
        </v-tab>
    </v-tabs>
</template>

<script setup lang="ts">
import { useTodoStore } from "../stores/todoStore";

const todoStore = useTodoStore();

const deleteTag = (tag: string): void => {
    todoStore.deleteTag(tag);
};

const handleTagChange = (value: unknown): void => {
    if (typeof value === "string") {
        todoStore.setActiveTag(value);
    }
};
</script>
