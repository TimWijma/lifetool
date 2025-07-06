<template>
    <div class="todo-form mb-4">
        <div class="form-content">
            <v-text-field
                v-model="newTodo"
                label="Add new todo"
                :error-messages="inputError"
                @keyup.enter="addTodo"
                @input="clearInputError"
                maxlength="200"
                density="compact"
                class="todo-input"
                hide-details="auto"
                clearable>
                <template v-slot:append>
                    <v-btn
                        color="primary"
                        @click="addTodo"
                        :disabled="!newTodo?.trim()"
                        size="small"
                        variant="elevated"
                        class="add-btn">
                        Add
                    </v-btn>
                </template>
            </v-text-field>

            <!-- Tags chips and add button -->
            <div class="tags-section">
                <v-chip
                    v-for="tag in newTodoTags"
                    :key="tag"
                    size="x-small"
                    color="primary"
                    variant="outlined"
                    closable
                    @click:close="removeTag(tag)"
                    class="tag-chip">
                    {{ tag }}
                </v-chip>

                <v-menu
                    v-model="tagMenuOpen"
                    location="bottom start"
                    :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <v-chip
                            v-bind="props"
                            size="x-small"
                            variant="tonal"
                            color="grey-lighten-1"
                            class="add-tag-chip">
                            <v-icon size="x-small">mdi-plus</v-icon>
                            Tag
                        </v-chip>
                    </template>
                    <v-card min-width="200">
                        <v-list density="compact">
                            <v-list-item
                                v-for="availableTag in availableTags"
                                :key="availableTag"
                                @click="addExistingTag(availableTag)"
                                class="tag-option">
                                <v-list-item-title>{{
                                    availableTag
                                }}</v-list-item-title>
                            </v-list-item>
                            <v-divider
                                v-if="availableTags.length > 0"></v-divider>
                            <v-list-item>
                                <v-text-field
                                    v-model="newTagInput"
                                    label="New tag"
                                    density="compact"
                                    @keyup.enter="addNewTag"
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTodoStore } from "../stores/todoStore";
import { useTodoForm } from "../composables/useTodoForm";

const todoStore = useTodoStore();
const {
    newTodo,
    newTodoTags,
    inputError,
    clearInputError,
    addTodo: originalAddTodo,
} = useTodoForm();

const tagMenuOpen = ref(false);
const newTagInput = ref("");

const availableTags = computed(() =>
    todoStore.allTags.filter((tag) => !newTodoTags.value.includes(tag))
);

const removeTag = (tag: string) => {
    const index = newTodoTags.value.indexOf(tag);
    if (index > -1) {
        newTodoTags.value.splice(index, 1);
    }
};

const addExistingTag = (tag: string) => {
    if (!newTodoTags.value.includes(tag)) {
        newTodoTags.value.push(tag);
    }
    tagMenuOpen.value = false;
};

const addNewTag = () => {
    const tag = newTagInput.value.trim();
    if (tag && !newTodoTags.value.includes(tag)) {
        newTodoTags.value.push(tag);
        newTagInput.value = "";
        tagMenuOpen.value = false;
    }
};

const addTodo = () => {
    console.log("Adding todo with tags:", newTodoTags.value); // Debug log
    originalAddTodo();
    newTagInput.value = "";
    tagMenuOpen.value = false;
};
</script>

<style scoped>
.todo-form {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.01);
}

.form-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.todo-input {
    flex: 1;
    min-width: 200px;
}

.add-btn {
    margin-left: 8px;
    min-width: 60px;
}

.tags-section {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    min-height: 32px;
    padding-top: 4px;
}

.tag-chip {
    transition: all 0.2s ease;
}

.add-tag-chip {
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;
}

.add-tag-chip:hover {
    opacity: 1;
    transform: scale(1.02);
}

.tag-option:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

@media (max-width: 600px) {
    .form-content {
        flex-direction: column;
        gap: 8px;
    }

    .tags-section {
        width: 100%;
        padding-top: 0;
    }
}
</style>
