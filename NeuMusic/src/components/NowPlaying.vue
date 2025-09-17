<template>
  <div class="now-playing-page page-container">
    <div v-if="!currentSong" class="no-song">
      <div class="no-song-icon">
        <i class="fas fa-music"></i>
      </div>
      <h3>暂无播放内容</h3>
      <p>选择一首歌曲开始播放</p>
      <router-link to="/discover" class="neu-button">
        <i class="fas fa-compass"></i>
        发现音乐
      </router-link>
    </div>

    <div v-else class="playing-content">
      <!-- 专辑封面和歌曲信息 -->
      <div class="song-display">
        <div class="album-cover-container">
          <div class="album-cover" :class="{ spinning: isPlaying }">
            <img :src="utils.getImageUrl(currentSong.al?.picUrl, 500)" :alt="currentSong.name" />
            <div class="vinyl-center"></div>
          </div>
          <div class="needle" :class="{ playing: isPlaying }"></div>
        </div>
        
        <div class="song-info">
          <h1 class="song-title">{{ currentSong.name }}</h1>
          <p class="song-artist">{{ getArtistNames(currentSong) }}</p>
          <p class="song-album">{{ currentSong.al?.name }}</p>
          
          <!-- 播放控制 -->
          <div class="player-controls">
            <button class="control-btn" @click="previousSong" title="上一首">
              <i class="fas fa-step-backward"></i>
            </button>
            <button class="control-btn play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            <button class="control-btn" @click="nextSong" title="下一首">
              <i class="fas fa-step-forward"></i>
            </button>
          </div>
          
          <!-- 进度条 -->
          <div class="progress-section">
            <span class="time current-time">{{ utils.formatTime(currentTime) }}</span>
            <div class="progress-bar" @click="seekTo">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
              </div>
            </div>
            <span class="time total-time">{{ utils.formatTime(duration) }}</span>
          </div>
          
          <!-- 音量和其他控制 -->
          <div class="additional-controls">
            <button class="control-btn small" @click="toggleLoop" :title="loopModeText">
              <i :class="loopIcon"></i>
            </button>
            <button class="control-btn small" @click="toggleShuffle" :class="{ active: isShuffled }" title="随机播放">
              <i class="fas fa-random"></i>
            </button>
            <div class="volume-control">
              <button class="control-btn small" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
                <i :class="volumeIcon"></i>
              </button>
              <div class="volume-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="volumeValue" 
                  @input="updateVolume"
                  class="volume-input"
                />
              </div>
            </div>
            <button class="control-btn small" @click="toggleLike" :class="{ liked: isLiked(currentSong.id) }" title="喜欢">
              <i class="fas fa-heart"></i>
            </button>
            <button class="control-btn small" @click="downloadSong" title="下载">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 歌词显示 -->
      <div class="lyrics-section" v-if="showLyrics">
        <div class="lyrics-container">
          <div v-if="loadingLyrics" class="lyrics-loading">
            <div class="loading-spinner"></div>
            <p>加载歌词中...</p>
          </div>
          <div v-else-if="lyrics.length === 0" class="no-lyrics">
            <i class="fas fa-music"></i>
            <p>暂无歌词</p>
          </div>
          <div v-else class="lyrics-list" ref="lyricsContainer">
            <div 
              v-for="(line, index) in lyrics" 
              :key="index"
              class="lyrics-line"
              :class="{ active: index === currentLyricIndex, past: index < currentLyricIndex }"
              @click="seekToLyric(line.time)"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePlayerStore, useUserStore, useAppStore } from '@/stores'
import { musicApi, utils } from '@/services'

const playerStore = usePlayerStore()
const userStore = useUserStore()
const appStore = useAppStore()

// 播放器状态
const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const currentTime = computed(() => playerStore.currentTime)
const duration = computed(() => playerStore.duration)
const currentIndex = computed(() => playerStore.currentIndex)
const playlist = computed(() => playerStore.playlist)
const loopMode = computed(() => playerStore.loopMode)
const isShuffled = computed(() => playerStore.isShuffled)
const volume = computed(() => playerStore.volume)
const isMuted = computed(() => playerStore.isMuted)

// 界面状态
const showLyrics = ref(true)
const volumeValue = ref(50)
const lyrics = ref([])
const currentLyricIndex = ref(-1)
const loadingLyrics = ref(false)
const lyricsContainer = ref(null)

// 计算属性
const progressPercentage = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const loopModeText = computed(() => {
  const modes = {
    'order': '顺序播放',
    'loop': '列表循环',
    'single': '单曲循环'
  }
  return modes[loopMode.value] || '顺序播放'
})

const loopIcon = computed(() => {
  const icons = {
    'order': 'fas fa-arrow-right',
    'loop': 'fas fa-redo',
    'single': 'fas fa-redo-alt'
  }
  return icons[loopMode.value] || 'fas fa-arrow-right'
})

const volumeIcon = computed(() => {
  if (isMuted.value || volumeValue.value === 0) {
    return 'fas fa-volume-mute'
  } else if (volumeValue.value < 50) {
    return 'fas fa-volume-down'
  } else {
    return 'fas fa-volume-up'
  }
})

// 方法
const togglePlay = () => {
  if (isPlaying.value) {
    playerStore.pause()
  } else {
    playerStore.play()
  }
}

const previousSong = () => {
  playerStore.previous()
}

const nextSong = () => {
  playerStore.next()
}

const seekTo = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = duration.value * percentage
  playerStore.seek(newTime)
}

const toggleLoop = () => {
  const modes = ['order', 'loop', 'single']
  const currentIndex = modes.indexOf(loopMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  playerStore.setLoopMode(modes[nextIndex])
}

const toggleShuffle = () => {
  playerStore.toggleShuffle()
}

const updateVolume = () => {
  playerStore.setVolume(volumeValue.value / 100)
}

const toggleMute = () => {
  playerStore.toggleMute()
}

const toggleLike = async () => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录')
    return
  }
  
  try {
    const isCurrentlyLiked = isLiked(currentSong.value.id)
    await musicApi.likeSong(currentSong.value.id, !isCurrentlyLiked)
    
    if (isCurrentlyLiked) {
      userStore.removeFromLikedSongs(currentSong.value.id)
    } else {
      userStore.addToLikedSongs(currentSong.value)
    }
    
    appStore.showSuccess(isCurrentlyLiked ? '已取消喜欢' : '已添加到我喜欢的音乐')
  } catch (error) {
    appStore.showError('操作失败')
  }
}

const downloadSong = () => {
  appStore.showInfo('下载功能开发中')
}

const isLiked = (songId) => {
  return userStore.likedSongs.some(song => song.id === songId)
}

const getArtistNames = (song) => {
  if (song.ar) {
    return song.ar.map(artist => artist.name).join(', ')
  }
  return '未知艺人'
}

// 歌词相关
const loadLyrics = async (songId) => {
  if (!songId) return
  
  loadingLyrics.value = true
  lyrics.value = []
  currentLyricIndex.value = -1
  
  try {
    const response = await musicApi.getLyric(songId)
    if (response.code === 200 && response.lrc?.lyric) {
      parseLyrics(response.lrc.lyric)
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
  } finally {
    loadingLyrics.value = false
  }
}

const parseLyrics = (lrcText) => {
  const lines = lrcText.split('\n')
  const parsed = []
  
  lines.forEach(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()
      
      if (text) {
        parsed.push({ time, text })
      }
    }
  })
  
  lyrics.value = parsed.sort((a, b) => a.time - b.time)
}

const seekToLyric = (time) => {
  playerStore.seek(time)
}

// 歌词滚动功能
const updateCurrentLyric = () => {
  if (lyrics.value.length === 0) return
  
  const currentTimeValue = currentTime.value
  let newIndex = -1
  
  for (let i = 0; i < lyrics.value.length; i++) {
    if (currentTimeValue >= lyrics.value[i].time) {
      newIndex = i
    } else {
      break
    }
  }
  
  if (newIndex !== currentLyricIndex.value) {
    currentLyricIndex.value = newIndex
    scrollToCurrentLyric()
  }
}

const scrollToCurrentLyric = () => {
  if (!lyricsContainer.value || currentLyricIndex.value === -1) return
  
  const container = lyricsContainer.value
  const currentLine = container.querySelector(`.lyrics-line:nth-child(${currentLyricIndex.value + 1})`)
  
  if (currentLine) {
    const containerHeight = container.clientHeight
    const lineHeight = currentLine.offsetHeight
    const lineTop = currentLine.offsetTop
    const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2
    
    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    })
  }
}

// 监听器
watch(currentSong, (newSong) => {
  if (newSong) {
    loadLyrics(newSong.id)
  } else {
    lyrics.value = []
    currentLyricIndex.value = -1
  }
})

watch(volume, (newVolume) => {
  volumeValue.value = newVolume * 100
})

// 生命周期
onMounted(() => {
  volumeValue.value = volume.value * 100
  
  if (currentSong.value) {
    loadLyrics(currentSong.value.id)
  }
})
</script>

<style scoped>
.now-playing-page {
  min-height: 100vh;
  padding: 40px 20px;
}

.no-song {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: var(--text-secondary);
}

.no-song-icon {
  font-size: 4em;
  margin-bottom: 20px;
  color: var(--text-muted);
}

.playing-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.song-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.album-cover-container {
  position: relative;
  width: 320px;
  height: 320px;
  margin-bottom: 40px;
}

.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-deep);
  position: relative;
  overflow: hidden;
}

.album-cover.spinning {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: var(--neu-bg);
  border-radius: 50%;
  box-shadow: var(--neu-shadow-inset);
}

.song-info {
  text-align: center;
  width: 100%;
  max-width: 500px;
}

.song-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

.control-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 20px;
}

.play-btn {
  width: 80px;
  height: 80px;
  font-size: 24px;
  background: var(--primary-color);
  color: white;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.progress-bar {
  flex: 1;
  height: 20px;
  cursor: pointer;
  padding: 8px 0;
}

.progress-track {
  position: relative;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
}

.additional-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.control-btn.small {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.lyrics-section {
  padding: 20px;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow-inset);
}

.lyrics-container {
  height: 400px;
  overflow-y: auto;
}

.lyrics-line {
  padding: 8px 16px;
  margin: 4px 0;
  font-size: 16px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.lyrics-line.active {
  color: var(--primary-color);
  font-weight: 500;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
}

@media (max-width: 1024px) {
  .playing-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .album-cover-container {
    width: 280px;
    height: 280px;
  }
}
</style>