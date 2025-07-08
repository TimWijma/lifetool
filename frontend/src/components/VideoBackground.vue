<template>
  <div class="video-background">
    <!-- Static Video -->
    <video
      v-if="currentVideo?.type === VideoSourceType.STATIC"
      ref="videoElement"
      :src="(currentVideo as StaticVideo).url"
      :muted="volume === 0"
      :volume="volume"
      autoplay
      loop
      playsinline
      class="background-video"
      @loadstart="onVideoLoadStart"
      @error="onVideoError"
    />
    
    <!-- YouTube Video -->
    <div
      v-else-if="currentVideo?.type === VideoSourceType.YOUTUBE"
      ref="youtubeContainer"
      class="youtube-container"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore, VideoSourceType, type StaticVideo, type YouTubeVideo } from '../stores/videoStore'

// Declare global YT types for TypeScript
declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, config: any) => any
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

const videoStore = useVideoStore()
const { currentVideo, isPlaying, volume } = storeToRefs(videoStore)

const videoElement = ref<HTMLVideoElement>()
const youtubeContainer = ref<HTMLDivElement>()
let youtubePlayer: any = null

// YouTube API
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve()
      return
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }

    if (!document.querySelector('script[src*="youtube"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })
}

const createYouTubePlayer = async (videoId: string) => {
  await loadYouTubeAPI()
  
  if (youtubePlayer) {
    youtubePlayer.destroy()
  }

  await nextTick()

  if (!youtubeContainer.value) {
    console.error('YouTube container not found')
    return
  }

  youtubePlayer = new window.YT.Player(youtubeContainer.value, {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      mute: 1, // Always muted since you want no audio
      loop: 1,
      playlist: videoId // Required for looping
    },
    events: {
      onReady: (event: any) => {
        if (isPlaying.value) {
          event.target.playVideo()
        } else {
          event.target.pauseVideo()
        }
      },
      onStateChange: (event: any) => {
        // Handle looping for YouTube videos
        if (event.data === window.YT.PlayerState.ENDED) {
          event.target.playVideo()
        }
      }
    }
  })
}

// Watch for video changes
watch(currentVideo, async (newVideo) => {
  if (!newVideo) return

  if (newVideo.type === VideoSourceType.YOUTUBE) {
    await createYouTubePlayer((newVideo as YouTubeVideo).videoId)
  } else {
    // Destroy YouTube player when switching to static video
    if (youtubePlayer) {
      youtubePlayer.destroy()
      youtubePlayer = null
    }
  }
}, { immediate: true })

// Watch for play/pause changes
watch(isPlaying, (playing) => {
  if (currentVideo.value?.type === VideoSourceType.STATIC && videoElement.value) {
    if (playing) {
      videoElement.value.play()
    } else {
      videoElement.value.pause()
    }
  } else if (youtubePlayer) {
    if (playing) {
      youtubePlayer.playVideo()
    } else {
      youtubePlayer.pauseVideo()
    }
  }
})

// Watch for volume changes
watch(volume, (newVolume) => {
  if (videoElement.value) {
    videoElement.value.volume = newVolume
    videoElement.value.muted = newVolume === 0
  }
  // YouTube videos stay muted as per requirements
})

const onVideoLoadStart = () => {
  console.log('Video started loading')
}

const onVideoError = (error: Event) => {
  console.error('Video error:', error)
}

onMounted(() => {
  // Initialize video playback state
  if (currentVideo.value?.type === VideoSourceType.STATIC && videoElement.value) {
    if (!isPlaying.value) {
      videoElement.value.pause()
    }
  }
})

onUnmounted(() => {
  if (youtubePlayer) {
    youtubePlayer.destroy()
  }
})
</script>

<style scoped>
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.background-video,
.youtube-container {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.youtube-container {
  position: relative;
}

/* Hide YouTube player UI */
.video-background :deep(iframe) {
  pointer-events: none;
  width: 100vw !important;
  height: 56.25vw !important; /* 16:9 aspect ratio */
  min-height: 100vh !important;
  min-width: 177.78vh !important; /* 16:9 aspect ratio */
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}
</style>