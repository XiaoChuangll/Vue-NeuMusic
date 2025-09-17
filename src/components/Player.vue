<template>
  <div class="player">
    <!-- 进度条 -->
    <div 
      class="progress-bar" 
      @click="handleProgressClick"
      ref="progressBar"
    >
      <div 
        class="progress-fill" 
        :style="{ width: progress + '%' }"
      ></div>
    </div>

    <!-- 专辑封面 -->
    <div class="player-cover" @click="showCurrentPlaying">
      <img 
        v-if="currentSong?.album?.picUrl" 
        :src="utils.getImageUrl(currentSong.album.picUrl, 100)"
        :alt="currentSong.name"
        class="cover-image"
      />
      <div v-else class="cover-placeholder">
        <i class="fas fa-music"></i>
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="player-info" @click="showCurrentPlaying">
      <div class="song-name">{{ currentSong?.name || '未在播放' }}</div>
      <div class="song-artist" v-if="currentSong">
        <span class="artist-name">{{ getArtistNames(currentSong) }}</span>
        <span v-if="currentSong.album?.name"> - </span>
        <span class="album-name">{{ currentSong.album?.name }}</span>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="player-controls">
      <!-- 循环模式 -->
      <button 
        class="control-button loop-button" 
        :class="{ active: playMode !== 0 }"
        @click="togglePlayMode"
        :title="playModeText"
      >
        <i class="fas fa-redo-alt" v-if="playMode === 0"></i>
        <i class="fas fa-redo-alt" v-else-if="playMode === 1"></i>
        <i class="fas fa-random" v-else></i>
      </button>

      <!-- 上一首 -->
      <button 
        class="control-button" 
        @click="playerStore.previous"
        :disabled="!hasPrevious"
      >
        <i class="fas fa-backward"></i>
      </button>

      <!-- 播放/暂停 -->
      <button 
        class="control-button primary" 
        @click="playerStore.togglePlay"
      >
        <i class="fas fa-play" v-if="!isPlaying"></i>
        <i class="fas fa-pause" v-else></i>
      </button>

      <!-- 下一首 -->
      <button 
        class="control-button" 
        @click="playerStore.next"
        :disabled="!hasNext"
      >
        <i class="fas fa-forward"></i>
      </button>

      <!-- 喜欢 -->
      <button 
        class="control-button" 
        :class="{ active: isLiked }"
        @click="toggleLike"
        v-if="currentSong"
      >
        <i class="fas fa-heart"></i>
      </button>

      <!-- 下载 -->
      <button 
        class="control-button" 
        @click="downloadSong"
        v-if="currentSong"
        title="下载当前歌曲"
      >
        <i class="fas fa-download"></i>
      </button>
    </div>

    <!-- 音量控制和时间显示 -->
    <div class="volume-control">
      <button class="volume-button" @click="toggleMute">
        <i class="fas fa-volume-up" v-if="volume > 0.5"></i>
        <i class="fas fa-volume-down" v-else-if="volume > 0"></i>
        <i class="fas fa-volume-mute" v-else></i>
      </button>
      <div 
        class="volume-slider" 
        @click="handleVolumeClick"
        ref="volumeSlider"
      >
        <div 
          class="volume-fill" 
          :style="{ width: (volume * 100) + '%' }"
        ></div>
      </div>
    </div>

    <div class="time-display">
      <span>{{ formattedCurrentTime }}</span>
      <span>/</span>
      <span>{{ formattedDuration }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore, useUserStore, useAppStore } from '@/stores'
import { musicApi, utils } from '@/services'

// Store 实例
const playerStore = usePlayerStore()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式引用
const progressBar = ref(null)
const volumeSlider = ref(null)

// 计算属性
const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const progress = computed(() => playerStore.progress)
const volume = computed(() => playerStore.volume)
const playMode = computed(() => playerStore.playMode)
const playModeText = computed(() => playerStore.playModeText)
const hasPrevious = computed(() => playerStore.hasPrevious)
const hasNext = computed(() => playerStore.hasNext)
const formattedCurrentTime = computed(() => playerStore.formattedCurrentTime)
const formattedDuration = computed(() => playerStore.formattedDuration)

const isLiked = computed(() => {
  return currentSong.value ? userStore.isLiked(currentSong.value.id) : false
})

// 方法
const getArtistNames = (song) => {
  if (!song?.artists) return ''
  return song.artists.map(artist => artist.name).join(', ')
}

const handleProgressClick = (event) => {
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = ((event.clientX - rect.left) / rect.width) * 100
  playerStore.setProgress(percent)
}

const handleVolumeClick = (event) => {
  if (!volumeSlider.value) return
  const rect = volumeSlider.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  playerStore.setVolume(Math.max(0, Math.min(1, percent)))
}

const toggleMute = () => {
  playerStore.setVolume(volume.value > 0 ? 0 : 0.8)
}

const togglePlayMode = () => {
  playerStore.togglePlayMode()
  appStore.showSuccess(`切换到${playModeText.value}`)
}

const showCurrentPlaying = () => {
  appStore.showModal('playingModal')
}

const toggleLike = async () => {
  if (!currentSong.value || !userStore.isLoggedIn) return
  
  try {
    const isCurrentlyLiked = isLiked.value
    await musicApi.likeSong(currentSong.value.id, !isCurrentlyLiked)
    
    // 更新本地喜欢列表
    if (isCurrentlyLiked) {
      const index = userStore.likeList.indexOf(currentSong.value.id)
      if (index > -1) {
        userStore.likeList.splice(index, 1)
      }
    } else {
      userStore.likeList.push(currentSong.value.id)
    }
    
    appStore.showSuccess(isCurrentlyLiked ? '已取消喜欢' : '已添加到我喜欢的音乐')
  } catch (error) {
    appStore.showError('操作失败')
  }
}

const downloadSong = async () => {
  if (!currentSong.value) return
  
  try {
    appStore.showSuccess('下载功能开发中...')
  } catch (error) {
    appStore.showError('下载失败')
  }
}
</script>

<style scoped>
@import '@/assets/css/player.css';
</style>