<template>
  <div class="modal-overlay" :class="{ active: isVisible }" @click="handleOverlayClick">
    <div class="modal-container playlist-modal" @click.stop>
      <div class="modal-header">
        <h2>歌单详情</h2>
        <button class="modal-close" @click="close">&times;</button>
      </div>
      <div class="modal-content">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <div class="error-message">{{ error }}</div>
          <button class="neu-button" @click="loadPlaylistDetail">重试</button>
        </div>
        
        <div v-else-if="playlist" class="playlist-detail">
          <!-- 歌单信息 -->  
          <div class="playlist-info">
            <div class="playlist-cover">
              <img :src="utils.getImageUrl(playlist.coverImgUrl, 300)" :alt="playlist.name" />
              <div class="play-overlay" @click="playAllSongs">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="playlist-meta">
              <h1>{{ playlist.name }}</h1>
              <p class="creator">by {{ playlist.creator?.nickname }}</p>
              <p class="description" v-if="playlist.description">{{ playlist.description }}</p>
              <div class="playlist-stats">
                <span><i class="fas fa-music"></i> {{ playlist.trackCount }} 首歌曲</span>
                <span><i class="fas fa-headphones"></i> {{ utils.formatPlayCount(playlist.playCount) }}</span>
                <span><i class="fas fa-calendar"></i> {{ formatDate(playlist.createTime) }}</span>
              </div>
              <div class="playlist-actions">
                <button class="neu-button primary" @click="playAllSongs">
                  <i class="fas fa-play"></i>
                  播放全部
                </button>
                <button class="neu-button" @click="collectPlaylist">
                  <i class="fas fa-heart" :class="{ liked: isCollected }"></i>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 歌曲列表 -->
          <div class="songs-section">
            <div class="songs-header">
              <h3>歌曲列表</h3>
              <div class="songs-actions">
                <button class="action-btn" @click="downloadAll" title="下载全部">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
            
            <div v-if="loadingSongs" class="loading-songs">
              <div class="loading-spinner small"></div>
              <p>加载歌曲中...</p>
            </div>
            
            <div v-else class="songs-list">
              <div 
                v-for="(song, index) in songs" 
                :key="song.id"
                class="song-item"
                @dblclick="playSong(song, index)"
              >
                <div class="song-index">{{ index + 1 }}</div>
                <div class="song-cover">
                  <img :src="utils.getImageUrl(song.al?.picUrl, 100)" :alt="song.name" />
                  <div class="song-overlay">
                    <i class="fas fa-play" @click="playSong(song, index)"></i>
                  </div>
                </div>
                <div class="song-info">
                  <h4 class="song-name">{{ song.name }}</h4>
                  <p class="song-artist">{{ getArtistNames(song) }}</p>
                  <p class="song-album">{{ song.al?.name }}</p>
                </div>
                <div class="song-duration">{{ formatDuration(song.dt) }}</div>
                <div class="song-actions">
                  <button class="action-btn" @click="playSong(song, index)" title="播放">
                    <i class="fas fa-play"></i>
                  </button>
                  <button class="action-btn" @click="addToPlaylist(song)" title="添加到播放列表">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button class="action-btn" @click="likeSong(song)" title="喜欢">
                    <i class="fas fa-heart" :class="{ liked: isLiked(song.id) }"></i>
                  </button>
                  <button class="action-btn" @click="downloadSong(song)" title="下载">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore, usePlayerStore, useUserStore } from '@/stores'
import { musicApi, utils } from '@/services'

const appStore = useAppStore()
const playerStore = usePlayerStore()
const userStore = useUserStore()

const isVisible = computed(() => appStore.modals.playlistModal)
const currentPlaylistId = computed(() => appStore.currentPlaylistId)

// 数据
const playlist = ref(null)
const songs = ref([])
const loading = ref(false)
const loadingSongs = ref(false)
const error = ref('')
const isCollected = ref(false)

// 方法
const loadPlaylistDetail = async () => {
  if (!currentPlaylistId.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 加载歌单详情
    const response = await musicApi.getPlaylistDetail(currentPlaylistId.value)
    if (response.code === 200) {
      playlist.value = response.playlist
      
      // 加载歌曲列表
      await loadSongs()
    } else {
      throw new Error(response.message || '加载歌单失败')
    }
  } catch (err) {
    console.error('加载歌单详情失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const loadSongs = async () => {
  if (!playlist.value) return
  
  loadingSongs.value = true
  
  try {
    const response = await musicApi.getPlaylistTracks(playlist.value.id)
    if (response.code === 200) {
      songs.value = response.songs || []
    } else {
      throw new Error('加载歌曲失败')
    }
  } catch (err) {
    console.error('加载歌曲失败:', err)
    appStore.showError('加载歌曲失败')
  } finally {
    loadingSongs.value = false
  }
}

const playSong = (song, index) => {
  playerStore.setPlaylist(songs.value, index)
  playerStore.play()
}

const playAllSongs = () => {
  if (songs.value.length > 0) {
    playerStore.setPlaylist(songs.value, 0)
    playerStore.play()
  }
}

const addToPlaylist = (song) => {
  playerStore.addToPlaylist(song)
  appStore.showSuccess('已添加到播放列表')
}

const likeSong = async (song) => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录')
    return
  }
  
  try {
    const isCurrentlyLiked = isLiked(song.id)
    await musicApi.likeSong(song.id, !isCurrentlyLiked)
    
    if (isCurrentlyLiked) {
      userStore.removeFromLikedSongs(song.id)
    } else {
      userStore.addToLikedSongs(song)
    }
    
    appStore.showSuccess(isCurrentlyLiked ? '已取消喜欢' : '已添加到我喜欢的音乐')
  } catch (error) {
    appStore.showError('操作失败')
  }
}

const downloadSong = (song) => {
  // 在真实应用中实现下载功能
  appStore.showInfo('下载功能开发中')
}

const downloadAll = () => {
  appStore.showInfo('批量下载功能开发中')
}

const collectPlaylist = async () => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录')
    return
  }
  
  // 在真实应用中实现收藏功能
  isCollected.value = !isCollected.value
  appStore.showSuccess(isCollected.value ? '已收藏歌单' : '已取消收藏')
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

const formatDuration = (duration) => {
  return utils.formatTime(duration / 1000)
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const close = () => {
  appStore.hideModal('playlistModal')
  // 清空数据
  playlist.value = null
  songs.value = []
  error.value = ''
}

const handleOverlayClick = () => {
  close()
}

// 监听歌单ID变化
watch(currentPlaylistId, (newId) => {
  if (newId && isVisible.value) {
    loadPlaylistDetail()
  }
})

// 监听模态框显示
watch(isVisible, (visible) => {
  if (visible && currentPlaylistId.value) {
    loadPlaylistDetail()
  }
})
</script>

<style scoped>
.playlist-modal .modal-container {
  max-width: 900px;
  max-height: 80vh;
}

.modal-content {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  font-size: 16px;
  margin-bottom: 20px;
}

/* 歌单信息 */
.playlist-info {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  padding: 24px;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow);
}

.playlist-cover {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.playlist-cover:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  color: white;
  font-size: 32px;
}

.playlist-meta {
  flex: 1;
  min-width: 0;
}

.playlist-meta h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.creator {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 16px 0;
  max-height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.playlist-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.playlist-stats i {
  font-size: 12px;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

.playlist-actions .neu-button {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.playlist-actions .neu-button.primary {
  background: var(--primary-color);
  color: white;
}

.playlist-actions .neu-button.primary:hover {
  background: var(--primary-color-dark);
}

.playlist-actions .neu-button i.liked {
  color: var(--danger-color);
}

/* 歌曲列表 */
.songs-section {
  padding: 0 24px;
}

.songs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.songs-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.songs-actions {
  display: flex;
  gap: 8px;
}

.loading-songs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-small);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.song-item:hover {
  box-shadow: var(--neu-shadow-hover-small);
}

.song-index {
  width: 32px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.song-cover {
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-small);
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-cover:hover .song-overlay {
  opacity: 1;
}

.song-overlay i {
  color: white;
  font-size: 16px;
}

.song-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.song-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist,
.song-album {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  color: var(--text-secondary);
  font-size: 13px;
  margin-right: 16px;
  min-width: 40px;
  text-align: center;
}

.song-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-small);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 11px;
}

.action-btn:hover {
  box-shadow: var(--neu-shadow-hover-small);
  color: var(--primary-color);
}

.action-btn i.liked {
  color: var(--danger-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-modal .modal-container {
    max-width: 95vw;
    margin: 20px;
  }
  
  .playlist-info {
    flex-direction: column;
    text-align: center;
  }
  
  .playlist-cover {
    width: 160px;
    height: 160px;
    margin: 0 auto;
  }
  
  .playlist-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .playlist-actions {
    justify-content: center;
  }
  
  .songs-section {
    padding: 0 16px;
  }
  
  .song-item {
    padding: 10px 12px;
  }
  
  .song-cover {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  
  .song-index {
    width: 28px;
  }
}
</style>