import { defineStore } from "pinia";
import { ref, computed, onScopeDispose } from "vue";

// Constants
const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds
const CYCLES_BEFORE_LONG_BREAK = 4;

export const enum TimerPhases {
    Work = "Work",
    ShortBreak = "Short Break",
    LongBreak = "Long Break",
}

interface PomodoroState {
    timeLeft: number;
    currentPhase: TimerPhases;
    completedCycles: number;
    isRunning: boolean;
}

export const usePomodoroStore = defineStore("pomodoro", () => {
    // State
    const timeLeft = ref<number>(WORK_DURATION);
    const currentPhase = ref<TimerPhases>(TimerPhases.Work);
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
            console.warn("Failed to load pomodoro state from localStorage:", error);
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
            console.warn("Failed to save pomodoro state to localStorage:", error);
        }
    };

    // Getters
    const initialDuration = computed(() => {
        switch (currentPhase.value) {
            case TimerPhases.Work:
                return WORK_DURATION;
            case TimerPhases.ShortBreak:
                return SHORT_BREAK_DURATION;
            case TimerPhases.LongBreak:
                return LONG_BREAK_DURATION;
            default:
                return WORK_DURATION;
        }
    });

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeLeft.value / 60);
        const seconds = timeLeft.value % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    });

    const progressPercentage = computed(() => {
        return ((initialDuration.value - timeLeft.value) / initialDuration.value) * 100;
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

        if (currentPhase.value === TimerPhases.Work) {
            completedCycles.value++;
            // Determine next break type
            if (completedCycles.value % CYCLES_BEFORE_LONG_BREAK === 0) {
                currentPhase.value = TimerPhases.LongBreak;
            } else {
                currentPhase.value = TimerPhases.ShortBreak;
            }
        } else {
            // Break completed, back to work
            currentPhase.value = TimerPhases.Work;
        }

        timeLeft.value = initialDuration.value;
        saveState();

        return currentPhase.value; // Return new phase for UI handling
    };

    const skipPhase = () => {
        pauseTimer();
        return completePhase();
    };

    const switchToPhase = (phase: TimerPhases) => {
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

    const resetStore = () => {
        cleanup();
        timeLeft.value = WORK_DURATION;
        currentPhase.value = TimerPhases.Work;
        completedCycles.value = 0;
        isRunning.value = false;
        saveState();
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
        resetStore,
    };
});
