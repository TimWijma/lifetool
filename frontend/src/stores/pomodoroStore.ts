import { defineStore } from "pinia";
import { ref, computed, onScopeDispose } from "vue";

// Constants
const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds
const CYCLES_BEFORE_LONG_BREAK = 4;

export type TimerPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
    timeLeft: number;
    currentPhase: TimerPhase;
    completedCycles: number;
    isRunning: boolean;
}

export const usePomodoroStore = defineStore("pomodoro", () => {
    // State
    const timeLeft = ref<number>(WORK_DURATION);
    const currentPhase = ref<TimerPhase>("work");
    const completedCycles = ref<number>(0);
    const isRunning = ref<boolean>(false);

    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Load from localStorage on store creation
    const loadState = () => {
        try {
            const stored = localStorage.getItem("lifetool-pomodoro");
            if (stored) {
                const parsed: PomodoroState = JSON.parse(stored);
                timeLeft.value = parsed.timeLeft;
                currentPhase.value = parsed.currentPhase;
                completedCycles.value = parsed.completedCycles;
                // Don't restore running state - always start paused
                isRunning.value = false;
            }
        } catch (error) {
            console.warn(
                "Failed to load pomodoro state from localStorage:",
                error
            );
        }
    };

    // Save to localStorage
    const saveState = () => {
        try {
            const state: PomodoroState = {
                timeLeft: timeLeft.value,
                currentPhase: currentPhase.value,
                completedCycles: completedCycles.value,
                isRunning: isRunning.value,
            };
            localStorage.setItem("lifetool-pomodoro", JSON.stringify(state));
        } catch (error) {
            console.warn(
                "Failed to save pomodoro state to localStorage:",
                error
            );
        }
    };

    // Getters
    const initialDuration = computed(() => {
        switch (currentPhase.value) {
            case "work":
                return WORK_DURATION;
            case "shortBreak":
                return SHORT_BREAK_DURATION;
            case "longBreak":
                return LONG_BREAK_DURATION;
            default:
                return WORK_DURATION;
        }
    });

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeLeft.value / 60);
        const seconds = timeLeft.value % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    });

    const progressPercentage = computed(() => {
        return (
            ((initialDuration.value - timeLeft.value) / initialDuration.value) *
            100
        );
    });

    // Actions
    const startTimer = () => {
        isRunning.value = true;
        intervalId = globalThis.setInterval(() => {
            if (timeLeft.value > 0) {
                timeLeft.value--;
                saveState();
            } else {
                // Timer reached zero - complete phase automatically
                completePhase();
            }
        }, 1000);
        saveState();
    };

    const pauseTimer = () => {
        isRunning.value = false;
        if (intervalId) {
            globalThis.clearInterval(intervalId);
            intervalId = null;
        }
        saveState();
    };

    const toggleTimer = () => {
        if (isRunning.value) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    const resetTimer = () => {
        pauseTimer();
        timeLeft.value = initialDuration.value;
        saveState();
    };

    const completePhase = () => {
        pauseTimer();

        if (currentPhase.value === "work") {
            completedCycles.value++;
            // Determine next break type
            if (completedCycles.value % CYCLES_BEFORE_LONG_BREAK === 0) {
                currentPhase.value = "longBreak";
            } else {
                currentPhase.value = "shortBreak";
            }
        } else {
            // Break completed, back to work
            currentPhase.value = "work";
        }

        timeLeft.value = initialDuration.value;
        saveState();

        return currentPhase.value; // Return new phase for UI handling
    };

    const skipPhase = () => {
        pauseTimer();
        return completePhase();
    };

    const switchToPhase = (phase: TimerPhase) => {
        pauseTimer();
        currentPhase.value = phase;
        timeLeft.value = initialDuration.value;
        saveState();
    };

    const cleanup = () => {
        if (intervalId) {
            globalThis.clearInterval(intervalId);
            intervalId = null;
        }
    };

    // Automatically cleanup when store scope is disposed
    onScopeDispose(cleanup);

    // Initialize store
    loadState();

    return {
        // State
        timeLeft,
        currentPhase,
        completedCycles,
        isRunning,
        // Getters
        initialDuration,
        formattedTime,
        progressPercentage,
        // Actions
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        completePhase,
        skipPhase,
        switchToPhase,
        cleanup,
    };
});
