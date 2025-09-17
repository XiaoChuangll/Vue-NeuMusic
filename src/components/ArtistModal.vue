<template>
  <div class="modal-overlay" :class="{ active: isVisible }" @click="handleOverlayClick">
    <div class="modal-container artist-modal" @click.stop>
      <div class="modal-header">
        <h2>歌手详情</h2>
        <button class="modal-close" @click="close">&times;</button>
      </div>
      <div class="modal-content">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <div class="error-message">{{ error }}</div>
          <button class="neu-button" @click="loadArtistDetail">重试</button>
        </div>
        
        <div v-else-if="artist" class="artist-detail">
          <!-- 歌手信息 -->
          <div class="artist-info">
            <div class="artist-avatar">
              <img :src="utils.getImageUrl(artist.img1v1Url, 300)" :alt="artist.name" />
            </div>
            <div class="artist-meta">
              <h1>{{ artist.name }}</h1>
              <p v-if="artist.alias && artist.alias.length > 0" class="artist-alias">{{ artist.alias.join(', ') }}</p>
              <p v-if="artist.briefDesc" class="artist-desc">{{ artist.briefDesc }}</p>
              <div class="artist-stats">
                <span><i class="fas fa-music"></i> {{ artist.musicSize || 0 }} 首歌曲</span>
                <span><i class="fas fa-compact-disc"></i> {{ artist.albumSize || 0 }} 张专辑</span>
                <span><i class="fas fa-users"></i> {{ utils.formatPlayCount(artist.followed || 0) }} 关注</span>
              </div>
              <div class="artist-actions">
                <button class="neu-button primary" @click="playTopSongs">
                  <i class="fas fa-play"></i>
                  播放热门歌曲
                </button>
                <button class="neu-button" @click="followArtist">
                  <i class="fas fa-heart" :class="{ liked: isFollowed }"></i>
                  {{ isFollowed ? '已关注' : '关注' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 热门歌曲 -->
          <div class="hot-songs-section">
            <div class="section-header">
              <h3>热门歌曲</h3>
              <button class="action-btn" @click="playTopSongs" title="播放全部">
                <i class="fas fa-play"></i>
              </button>
            </div>
            
            <div v-if="loadingSongs" class="loading-songs">
              <div class="loading-spinner small"></div>
              <p>加载歌曲中...</p>
            </div>
            
            <div v-else class="songs-list">
              <div 
                v-for="(song, index) in topSongs.slice(0, 10)" 
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
                  <p class="song-album">{{ song.al?.name }}</p>
                </div>
                <div class="song-popularity">
                  <div class="popularity-bar">
                    <div class="popularity-fill" :style="{ width: getPopularityWidth(song.pop) }"></div>
                  </div>
                </div>
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
            
            <div v-if="topSongs.length > 10" class="view-more">
              <button class="neu-button" @click="showAllSongs = !showAllSongs">
                {{ showAllSongs ? '收起' : '查看更多' }}
                <i :class="showAllSongs ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </button>
            </div>
          </div>
          
          <!-- 所有歌曲（展开时显示） -->
          <div v-if="showAllSongs && topSongs.length > 10" class="all-songs-section">
            <div class="songs-list">
              <div 
                v-for="(song, index) in topSongs.slice(10)" 
                :key="song.id"
                class="song-item"
                @dblclick="playSong(song, index + 10)"
              >
                <div class="song-index">{{ index + 11 }}</div>
                <div class="song-cover">
                  <img :src="utils.getImageUrl(song.al?.picUrl, 100)" :alt="song.name" />
                  <div class="song-overlay">
                    <i class="fas fa-play" @click="playSong(song, index + 10)"></i>
                  </div>
                </div>
                <div class="song-info">
                  <h4 class="song-name">{{ song.name }}</h4>
                  <p class="song-album">{{ song.al?.name }}</p>
                </div>
                <div class="song-popularity">
                  <div class="popularity-bar">
                    <div class="popularity-fill" :style="{ width: getPopularityWidth(song.pop) }"></div>
                  </div>
                </div>
                <div class="song-actions">
                  <button class="action-btn" @click="playSong(song, index + 10)" title="播放">
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

const isVisible = computed(() => appStore.modals.artistModal)
const currentArtistId = computed(() => appStore.currentArtistId)

// 数据
const artist = ref(null)
const topSongs = ref([])
const loading = ref(false)
const loadingSongs = ref(false)
const error = ref('')
const isFollowed = ref(false)
const showAllSongs = ref(false)

// 方法
const loadArtistDetail = async () => {
  if (!currentArtistId.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 加载歌手详情
    const response = await musicApi.getArtistDetail(currentArtistId.value)
    if (response.code === 200) {
      artist.value = response.data.artist
      
      // 加载热门歌曲
      await loadTopSongs()
    } else {
      throw new Error(response.message || '加载歌手失败')
    }
  } catch (err) {
    console.error('加载歌手详情失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const loadTopSongs = async () => {
  if (!currentArtistId.value) return
  
  loadingSongs.value = true
  
  try {
    const response = await musicApi.getArtistTopSongs(currentArtistId.value)
    if (response.code === 200) {
      topSongs.value = response.songs || []
    } else {
      throw new Error('加载歌曲失败')
    }
  } catch (err) {
    console.error('加载热门歌曲失败:', err)
    appStore.showError('加载歌曲失败')
  } finally {
    loadingSongs.value = false
  }
}

const playSong = (song, index) => {
  playerStore.setPlaylist(topSongs.value, index)
  playerStore.play()
}

const playTopSongs = () => {
  if (topSongs.value.length > 0) {
    playerStore.setPlaylist(topSongs.value, 0)
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
  appStore.showInfo('下载功能开发中')
}

const followArtist = async () => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录')
    return
  }
  
  // 在真实应用中实现关注功能
  isFollowed.value = !isFollowed.value
  appStore.showSuccess(isFollowed.value ? '已关注歌手' : '已取消关注')
}

const isLiked = (songId) => {
  return userStore.likedSongs.some(song => song.id === songId)
}

const getPopularityWidth = (popularity) => {
  return `${Math.min(popularity || 0, 100)}%`
}

const close = () => {
  appStore.hideModal('artistModal')
  // 清空数据
  artist.value = null
  topSongs.value = []
  error.value = ''
  showAllSongs.value = false
}

const handleOverlayClick = () => {
  close()
}

// 监听歌手ID变化
watch(currentArtistId, (newId) => {
  if (newId && isVisible.value) {
    loadArtistDetail()
  }
})

// 监听模态框显示
watch(isVisible, (visible) => {
  if (visible && currentArtistId.value) {
    loadArtistDetail()
  }
})
</script>

<style scoped>
.artist-modal .modal-container {
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

/* 歌手信息 */
.artist-info {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  padding: 24px;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow);
}

.artist-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-meta {
  flex: 1;
  min-width: 0;
}

.artist-meta h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.artist-alias {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.artist-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 16px 0;
  max-height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.artist-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.artist-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.artist-stats i {
  font-size: 12px;
}

.artist-actions {
  display: flex;
  gap: 12px;
}

.artist-actions .neu-button {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.artist-actions .neu-button.primary {
  background: var(--primary-color);
  color: white;
}

.artist-actions .neu-button.primary:hover {
  background: var(--primary-color-dark);
}

.artist-actions .neu-button i.liked {
  color: var(--danger-color);
}

/* 热门歌曲 */
.hot-songs-section,
.all-songs-section {
  padding: 0 24px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
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

.song-album {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-popularity {
  width: 60px;
  margin-right: 16px;
}

.popularity-bar {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.popularity-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
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

.view-more {
  text-align: center;
  margin: 20px 0;
}

.view-more .neu-button {
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .artist-modal .modal-container {
    max-width: 95vw;
    margin: 20px;
  }
  
  .artist-info {
    flex-direction: column;
    text-align: center;
  }
  
  .artist-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }
  
  .artist-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .artist-actions {
    justify-content: center;
  }
  
  .hot-songs-section,
  .all-songs-section {
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
  
  .song-popularity {
    width: 40px;
  }
}
</style>