import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export enum VideoSourceType {
  STATIC = 'static',
  YOUTUBE = 'youtube'
}

export interface StaticVideo {
  id: string
  name: string
  url: string
  type: VideoSourceType.STATIC
}

export interface YouTubeVideo {
  id: string
  name: string
  videoId: string
  type: VideoSourceType.YOUTUBE
}

export type VideoSource = StaticVideo | YouTubeVideo

export const useVideoStore = defineStore('video', () => {
  // State
  const isPlaying = ref(true)
  const currentVideoId = ref<string>('forest-loop')
  const volume = ref(0) // Start muted since you want no audio
  
  // Available video sources
  const videoSources = ref<VideoSource[]>([
    {
      id: 'forest-loop',
      name: 'Forest Loop',
      url: '/videos/forest-loop.mp4',
      type: VideoSourceType.STATIC
    },
    {
      id: 'rain-loop',
      name: 'Rain Loop', 
      url: '/videos/rain-loop.mp4',
      type: VideoSourceType.STATIC
    },
    {
      id: 'fireplace-loop',
      name: 'Fireplace Loop',
      url: '/videos/fireplace-loop.mp4', 
      type: VideoSourceType.STATIC
    },
    {
      id: 'lofi-study',
      name: 'Lofi Study',
      videoId: 'jfKfPfyJRdk', // Popular lofi hip hop stream
      type: VideoSourceType.YOUTUBE
    },
    {
      id: 'peaceful-nature',
      name: 'Peaceful Nature',
      videoId: '36YnV9STBqc', // Nature sounds video
      type: VideoSourceType.YOUTUBE
    }
  ])

  // Getters
  const currentVideo = computed(() => {
    return videoSources.value.find(v => v.id === currentVideoId.value)
  })

  // Actions
  const setCurrentVideo = (videoId: string) => {
    currentVideoId.value = videoId
    saveToLocalStorage()
  }

  const togglePlayPause = () => {
    isPlaying.value = !isPlaying.value
    saveToLocalStorage()
  }

  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('lifetool-video', JSON.stringify({
        currentVideoId: currentVideoId.value,
        isPlaying: isPlaying.value,
        volume: volume.value
      }))
    } catch (error) {
      console.warn('Failed to save video state:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('lifetool-video')
      if (stored) {
        const parsed = JSON.parse(stored)
        currentVideoId.value = parsed.currentVideoId || 'forest-loop'
        isPlaying.value = parsed.isPlaying ?? true
        volume.value = parsed.volume ?? 0
      }
    } catch (error) {
      console.warn('Failed to load video state:', error)
    }
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    isPlaying,
    currentVideoId,
    volume,
    videoSources,
    // Getters
    currentVideo,
    // Actions
    setCurrentVideo,
    togglePlayPause,
    setVolume
  }
})