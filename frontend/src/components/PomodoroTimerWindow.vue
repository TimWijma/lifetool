<template>
    <v-row class="text-center">
        <v-col cols="12" class="pb-2">
            <!-- Phase selection tabs -->
            <div class="phase-tabs">
                <v-btn-toggle
                    :model-value="pomodoroStore.currentPhase"
                    @update:model-value="switchPhase"
                    color="primary"
                    variant="outlined"
                    divided
                    mandatory>
                    <v-btn :value="TimerPhases.Work" size="small">Work</v-btn>
                    <v-btn :value="TimerPhases.ShortBreak" size="small">Short Break</v-btn>
                    <v-btn :value="TimerPhases.LongBreak" size="small">Long Break</v-btn>
                </v-btn-toggle>
            </div>

            <div class="timer-display mb-4">
                <h1
                    :class="{
                        'timer-warning': pomodoroStore.timeLeft <= 60 && pomodoroStore.isRunning,
                    }"
                    role="timer"
                    :aria-label="`Timer: ${pomodoroStore.formattedTime} remaining`"
                    class="timer-text">
                    {{ pomodoroStore.formattedTime }}
                </h1>
            </div>
            <v-progress-linear
                :model-value="pomodoroStore.progressPercentage"
                height="8"
                color="primary"
                class="mb-4 progress-bar"
                rounded></v-progress-linear>
        </v-col>

        <v-col cols="12" class="py-2">
            <div class="button-container">
                <!-- Main play/pause button -->
                <v-btn
                    @click="toggleTimer"
                    :color="pomodoroStore.isRunning ? 'error' : 'success'"
                    :disabled="pomodoroStore.timeLeft === 0"
                    size="large"
                    class="main-button"
                    elevation="2">
                    <v-icon start>{{ pomodoroStore.isRunning ? "mdi-pause" : "mdi-play" }}</v-icon>
                    {{
                        pomodoroStore.isRunning
                            ? "Pause"
                            : pomodoroStore.timeLeft === pomodoroStore.initialDuration
                            ? "Start"
                            : "Resume"
                    }}
                </v-btn>

                <v-btn
                    @click="skipPhase"
                    color="warning"
                    variant="outlined"
                    size="small"
                    icon
                    class="mx-1"
                    :disabled="
                        !pomodoroStore.isRunning &&
                        pomodoroStore.timeLeft === pomodoroStore.initialDuration
                    ">
                    <v-icon>mdi-skip-next</v-icon>
                    <v-tooltip activator="parent" location="bottom">Skip Phase</v-tooltip>
                </v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";
import { TimerPhases, usePomodoroStore } from "../stores/pomodoroStore";

const pomodoroStore = usePomodoroStore();

// Non-persistent UI state
const lastCompletedPhase = ref<TimerPhases>(TimerPhases.Work);

watch(
    () => pomodoroStore.timeLeft,
    (newTimeLeft, oldTimeLeft) => {
        // If timer went from >0 to 0, a phase completed
        if (
            oldTimeLeft > 0 &&
            newTimeLeft === pomodoroStore.initialDuration &&
            !pomodoroStore.isRunning
        ) {
            lastCompletedPhase.value =
                pomodoroStore.currentPhase === TimerPhases.Work
                    ? TimerPhases.ShortBreak
                    : TimerPhases.Work;
            playNotificationSound();
        }
    }
);

// Timer functions that handle UI feedback
const toggleTimer = (): void => {
    pomodoroStore.toggleTimer();
};

const skipPhase = (): void => {
    lastCompletedPhase.value = pomodoroStore.currentPhase;
    pomodoroStore.skipPhase();
    playNotificationSound();
};

const switchPhase = (phase: string): void => {
    pomodoroStore.switchToPhase(phase as any);
};

const playNotificationSound = (): void => {
    try {
        const AudioContextClass =
            (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log("Timer completed!");
    }
};

// Cleanup
onUnmounted(() => {
    pomodoroStore.cleanup();
});
</script>

<style scoped>
.timer-warning {
    color: #f44336;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
    100% {
        opacity: 1;
    }
}

.timer-display {
    padding: 1rem 0;
}

.timer-text {
    font-size: 3.5rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 0;
}

.progress-bar {
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.button-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
}

.main-button {
    min-width: 140px;
    font-weight: 500;
}

.cycles-section {
    padding-top: 0.5rem;
}

.cycles-text {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
    margin: 0;
}

.phase-tabs {
    display: flex;
    justify-content: center;
}

.phase-tabs .v-btn-toggle {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.phase-tabs .v-btn {
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0.025em;
}

/* Responsive design */
@media (max-width: 600px) {
    .timer-text {
        font-size: 2.5rem;
    }

    .button-container {
        gap: 0.75rem;
    }

    .phase-tabs .v-btn {
        font-size: 0.75rem;
        padding: 0 8px;
    }
}
</style>
