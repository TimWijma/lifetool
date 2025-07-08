import { defineStore } from "pinia";
import { ref, computed, type Component } from "vue";
import { generateUniqueId } from "../utils/idGenerator";

export enum WindowType {
    POMODORO = "pomodoro",
    TODO = "todo",
    VIDEO = "video",
}

export interface WindowConfig {
    title: string;
    defaultX: number;
    defaultY: number;
    icon: string;
    component: Component;
    headerComponent?: Component;
    minWidth: number;
    minHeight: number;
    defaultWidth: number;
    defaultHeight: number;
}

export interface WindowState {
    id: string;
    type: WindowType;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isVisible: boolean;
    zIndex: number;
}

export const useWindowStore = defineStore("windows", () => {
    // State
    const windows = ref<Map<WindowType, WindowState>>(new Map());
    const maxZIndex = ref(200);

    // Load from localStorage on store creation
    const loadWindowStates = () => {
        try {
            const stored = localStorage.getItem("lifetool-windows");
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([type, state]) => {
                    const windowState = state as WindowState;
                    // Ensure IDs are strings and regenerate if needed
                    if (!windowState.id || typeof windowState.id !== "string") {
                        windowState.id = generateUniqueId();
                    }
                    windows.value.set(type as WindowType, windowState);
                    maxZIndex.value = Math.max(
                        maxZIndex.value,
                        windowState.zIndex + 1
                    );
                });
            }
        } catch (error) {
            console.warn(
                "Failed to load window states from localStorage:",
                error
            );
        }
    };

    // Save to localStorage
    const saveWindowStates = () => {
        try {
            const dataToSave = {} as Record<WindowType, WindowState>;
            windows.value.forEach((state, type) => {
                dataToSave[type] = state;
            });
            localStorage.setItem(
                "lifetool-windows",
                JSON.stringify(dataToSave)
            );
        } catch (error) {
            console.warn(
                "Failed to save window states to localStorage:",
                error
            );
        }
    };

    // Getters
    const visibleWindows = computed(() => {
        const visible: WindowState[] = [];
        for (const windowState of windows.value.values()) {
            if (windowState.isVisible) {
                visible.push(windowState);
            }
        }
        return visible;
    });

    // Actions
    const initializeWindow = (type: WindowType, config: WindowConfig) => {
        if (!windows.value.has(type)) {
            windows.value.set(type, {
                id: generateUniqueId(),
                type,
                title: config.title,
                x: config.defaultX,
                y: config.defaultY,
                width: config.defaultWidth,
                height: config.defaultHeight,
                isVisible: false,
                zIndex: maxZIndex.value++,
            });
            saveWindowStates();
        }
    };

    const getWindow = (type: WindowType): WindowState | undefined => {
        return windows.value.get(type);
    };

    const toggleWindow = (type: WindowType) => {
        const windowState = windows.value.get(type);
        if (windowState) {
            windowState.isVisible = !windowState.isVisible;

            // If window is becoming visible, bring it to the front
            if (windowState.isVisible) {
                maxZIndex.value += 1;
                windowState.zIndex = maxZIndex.value;
            }

            saveWindowStates();
        }
    };

    const closeWindow = (type: WindowType) => {
        const windowState = windows.value.get(type);
        if (windowState) {
            windowState.isVisible = false;
            saveWindowStates();
        }
    };

    const updateWindowPosition = (
        type: WindowType,
        position: { x: number; y: number }
    ) => {
        const windowState = windows.value.get(type);
        if (!windowState) return;

        // Apply boundary constraints using current window dimensions
        const viewportWidth = globalThis.window.innerWidth;
        const viewportHeight = globalThis.window.innerHeight;

        const maxX = Math.max(0, viewportWidth - windowState.width);
        const maxY = Math.max(0, viewportHeight - windowState.height);

        windowState.x = Math.max(0, Math.min(position.x, maxX));
        windowState.y = Math.max(0, Math.min(position.y, maxY));
        saveWindowStates();
    };

    const updateWindowSize = (
        type: WindowType,
        size: { width: number; height: number },
        config: WindowConfig
    ) => {
        const windowState = windows.value.get(type);
        if (!windowState) return;

        const viewportWidth = globalThis.window.innerWidth;
        const viewportHeight = globalThis.window.innerHeight;

        // Apply minimum and maximum constraints
        windowState.width = Math.max(
            config.minWidth,
            Math.min(size.width, viewportWidth)
        );
        windowState.height = Math.max(
            config.minHeight,
            Math.min(size.height, viewportHeight)
        );

        // Ensure window doesn't go out of bounds after resize
        updateWindowPosition(type, { x: windowState.x, y: windowState.y });
    };

    const bringToFront = (type: WindowType) => {
        const windowState = windows.value.get(type);
        if (windowState) {
            maxZIndex.value += 1;
            windowState.zIndex = maxZIndex.value;
            saveWindowStates();
        }
    };

    const cleanup = () => {
        windows.value.clear();
    };

    // Initialize store
    loadWindowStates();

    return {
        // State
        windows,
        maxZIndex,
        // Getters
        visibleWindows,
        // Actions
        initializeWindow,
        getWindow,
        toggleWindow,
        closeWindow,
        updateWindowPosition,
        updateWindowSize,
        bringToFront,
        cleanup,
    };
});
