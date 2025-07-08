<template>
  <div class="video-control-window">
    <!-- Current Video Info -->
    <div class="current-video">
      <v-icon :icon="currentVideo?.type === VideoSourceType.YOUTUBE ? 'mdi-youtube' : 'mdi-file-video'" />
      <span class="video-name">{{ currentVideo?.name || 'No video selected' }}</span>
    </div>

    <!-- Play/Pause Controls -->
    <div class="playback-controls">
      <v-btn
        :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
        variant="text"
        @click="videoStore.togglePlayPause()"
      />
    </div>

    <!-- Video Selection -->
    <div class="video-selection">
      <v-select
        :model-value="currentVideoId"
        :items="videoOptions"
        item-title="name"
        item-value="id"
        label="Select Video"
        variant="outlined"
        density="compact"
        @update:model-value="videoStore.setCurrentVideo"
      >
        <template #item="{ props, item }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon :icon="item.raw.type === VideoSourceType.YOUTUBE ? 'mdi-youtube' : 'mdi-file-video'" />
            </template>
          </v-list-item>
        </template>
      </v-select>
    </div>

    <!-- Volume Control (kept for future use even though we start muted) -->
    <div class="volume-control">
      <v-icon icon="mdi-volume-high" />
      <v-slider
        :model-value="volume"
        min="0"
        max="1"
        step="0.1"
        hide-details
        density="compact"
        @update:model-value="videoStore.setVolume"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore, VideoSourceType } from '../stores/videoStore'

const videoStore = useVideoStore()
const { currentVideo, currentVideoId, isPlaying, volume, videoSources } = storeToRefs(videoStore)

const videoOptions = computed(() => {
  return videoSources.value.map(video => ({
    id: video.id,
    name: video.name,
    type: video.type
  }))
})
</script>

<style scoped>
.video-control-window {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.current-video {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.video-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playback-controls {
  display: flex;
  justify-content: center;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-control .v-slider {
  flex: 1;
}
</style>