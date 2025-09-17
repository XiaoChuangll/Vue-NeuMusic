<template>
  <div class="home-page page-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1>NeuMusic</h1>
      <p class="welcome-subtitle">新拟态风格的音乐世界，与你共享</p>
      
      <div class="quick-actions">
        <button 
          v-if="!userStore.isLoggedIn" 
          class="neu-button primary-btn"
          @click="$router.push('/login')"
        >
          <i class="fas fa-sign-in-alt"></i>
          立即登录
        </button>
        
        <button 
          class="neu-button"
          @click="$router.push('/discover')"
        >
          <i class="fas fa-compass"></i>
          发现音乐
        </button>
        
        <button 
          class="neu-button"
          @click="exploreDemo"
        >
          <i class="fas fa-music"></i>
          体验演示
        </button>
      </div>
    </div>

    <!-- 用户个人区域 -->
    <div v-if="userStore.isLoggedIn" class="user-section">
      <div class="user-greeting">
        <div class="user-avatar-large">
          <img 
            v-if="userStore.avatarUrl" 
            :src="userStore.avatarUrl" 
            :alt="userStore.nickname"
          />
          <i v-else class="fas fa-user"></i>
        </div>
        <div class="greeting-text">
          <h2>欢迎回来，{{ userStore.nickname }}！</h2>
          <p class="greeting-time">{{ greetingMessage }}</p>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-card neu-card">
          <div class="stat-number">{{ userStore.createdPlaylists.length }}</div>
          <div class="stat-label">创建的歌单</div>
        </div>
        <div class="stat-card neu-card">
          <div class="stat-number">{{ userStore.subscribedPlaylists.length }}</div>
          <div class="stat-label">收藏的歌单</div>
        </div>
        <div class="stat-card neu-card">
          <div class="stat-number">{{ userStore.likeList.length }}</div>
          <div class="stat-label">喜欢的音乐</div>
        </div>
      </div>

      <div class="user-playlists" v-if="userStore.createdPlaylists.length > 0">
        <h3 class="section-title">我的歌单</h3>
        <div class="playlist-grid">
          <div 
            v-for="playlist in userStore.createdPlaylists.slice(0, 6)" 
            :key="playlist.id"
            class="playlist-card neu-card"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover">
              <img :src="utils.getImageUrl(playlist.coverImgUrl, 200)" :alt="playlist.name" />
              <div class="playlist-overlay">
                <i class="fas fa-play-circle"></i>
              </div>
            </div>
            <div class="playlist-info">
              <h4>{{ playlist.name }}</h4>
              <p>{{ playlist.trackCount }} 首歌曲</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游客推荐区域 -->
    <div v-else class="guest-section">
      <div class="feature-highlights">
        <h2 class="section-title">精彩功能</h2>
        <div class="feature-grid">
          <div class="feature-card neu-card">
            <div class="feature-icon">
              <i class="fas fa-headphones"></i>
            </div>
            <h3>高品质音乐</h3>
            <p>支持无损音质，享受纯净音乐体验</p>
          </div>
          <div class="feature-card neu-card">
            <div class="feature-icon">
              <i class="fas fa-music"></i>
            </div>
            <h3>个性化歌单</h3>
            <p>智能推荐，创建专属于你的音乐歌单</p>
          </div>
          <div class="feature-card neu-card">
            <div class="feature-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>多端同步</h3>
            <p>手机、电脑、平板，随时随地享受音乐</p>
          </div>
          <div class="feature-card neu-card">
            <div class="feature-icon">
              <i class="fas fa-heart"></i>
            </div>
            <h3>社交音乐</h3>
            <p>分享你的音乐品味，发现同好朋友</p>
          </div>
        </div>
      </div>

      <!-- 热门推荐 -->
      <div class="hot-recommendations" v-if="hotSongs.length > 0">
        <h2 class="section-title">热门推荐</h2>
        <div class="song-grid">
          <div 
            v-for="(song, index) in hotSongs" 
            :key="song.id"
            class="song-card neu-card"
            @click="previewSong(song)"
          >
            <div class="song-cover">
              <img :src="utils.getImageUrl(song.album?.picUrl, 150)" :alt="song.name" />
              <div class="song-overlay">
                <i class="fas fa-play"></i>
              </div>
              <div class="song-rank">{{ index + 1 }}</div>
            </div>
            <div class="song-details">
              <h4>{{ song.name }}</h4>
              <p>{{ getArtistNames(song) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 登录提示 -->
      <div class="login-promotion">
        <div class="promotion-content neu-card">
          <div class="promotion-icon">
            <i class="fas fa-crown"></i>
          </div>
          <div class="promotion-text">
            <h3>解锁更多精彩功能</h3>
            <p>登录后可以创建歌单、收藏音乐、同步听歌记录</p>
          </div>
          <button class="promotion-btn neu-button" @click="$router.push('/login')">
            <i class="fas fa-sign-in-alt"></i>
            立即登录
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore, usePlayerStore, useAppStore } from '@/stores'
import { musicApi, utils } from '@/services'

const userStore = useUserStore()
const playerStore = usePlayerStore()
const appStore = useAppStore()

// 响应式数据
const loading = ref(false)
const hotSongs = ref([])

// 计算属性
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '深夜好，夜猫子'
  if (hour < 12) return '早上好，新的一天开始了'
  if (hour < 18) return '下午好，休息一下吧'
  return '晚上好，放松的时间到了'
})

// 方法
const exploreDemo = () => {
  appStore.showSuccess('体验演示功能开发中...')
}

const openPlaylist = (playlist) => {
  console.log('打开歌单:', playlist)
  if (playlist?.id) {
    appStore.showPlaylistModal(playlist.id)
  } else {
    appStore.showModal('playlistModal')
  }
}

const getArtistNames = (song) => {
  if (!song?.artists || !Array.isArray(song.artists)) return '未知歌手'
  return song.artists.map(artist => artist.name).join(' / ')
}

const previewSong = async (song) => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录以体验完整功能')
    return
  }
  
  try {
    await playerStore.playSong(song, [song], 0)
    appStore.showSuccess(`开始播放: ${song.name}`)
  } catch (error) {
    appStore.showError('播放失败')
  }
}

const loadHotSongs = async () => {
  try {
    loading.value = true
    // 获取热门歌曲数据
    const response = await musicApi.getPersonalizedNewsong(8)
    if (response.code === 200) {
      hotSongs.value = response.result.map(item => ({
        id: item.id,
        name: item.name,
        artists: item.song?.artists || [],
        album: item.song?.album || {}
      }))
    }
  } catch (error) {
    console.error('加载热门歌曲失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  if (!userStore.isLoggedIn) {
    loadHotSongs()
  }
})
</script>

<style scoped>
/* 首页样式 */
.home-page {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-section h1 {
  font-size: 3.5em;
  background: linear-gradient(135deg, var(--primary-color), #00c9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  font-weight: 900;
}

.welcome-subtitle {
  font-size: 1.3em;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-actions .neu-button {
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary-color), #0088bb);
  color: white;
  box-shadow: 0 6px 20px rgba(0, 161, 214, 0.3);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 161, 214, 0.4);
}

/* 用户区域 */
.user-section {
  margin-bottom: 40px;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: var(--surface-color);
  border-radius: var(--border-radius-large);
  box-shadow: var(--neu-shadow);
  margin-bottom: 30px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: var(--neu-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  font-size: 2em;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.greeting-text h2 {
  margin: 0 0 5px 0;
  font-size: 1.8em;
  color: var(--text-color);
}

.greeting-time {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1em;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  padding: 25px 15px;
  border-radius: var(--border-radius-large);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--neu-shadow-hover);
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9em;
}

/* 歌单网格 */
.section-title {
  font-size: 1.8em;
  color: var(--text-color);
  margin: 40px 0 25px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--primary-color);
  display: inline-block;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--neu-shadow-hover);
}

.playlist-cover {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .playlist-cover img {
  transform: scale(1.1);
}

.playlist-overlay {
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

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.playlist-overlay i {
  font-size: 3em;
  color: white;
}

.playlist-info {
  padding: 15px;
}

.playlist-info h4 {
  margin: 0 0 8px 0;
  font-size: 1em;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-info p {
  margin: 0;
  font-size: 0.9em;
  color: var(--text-secondary);
}

/* 游客区域 */
.guest-section {
  margin-top: 40px;
}

.feature-highlights {
  margin-bottom: 50px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: var(--border-radius-large);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--neu-shadow-hover);
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #00c9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 1.5em;
}

.feature-card h3 {
  margin: 0 0 15px 0;
  font-size: 1.3em;
  color: var(--text-color);
}

.feature-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 热门推荐 */
.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.song-card {
  cursor: pointer;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  transition: all 0.3s ease;
}

.song-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--neu-shadow-hover);
}

.song-cover {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.song-card:hover .song-cover img {
  transform: scale(1.1);
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

.song-card:hover .song-overlay {
  opacity: 1;
}

.song-overlay i {
  font-size: 2.5em;
  color: white;
}

.song-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
}

.song-details {
  padding: 12px;
}

.song-details h4 {
  margin: 0 0 5px 0;
  font-size: 0.9em;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-details p {
  margin: 0;
  font-size: 0.8em;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 登录推广 */
.login-promotion {
  margin-top: 50px;
}

.promotion-content {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 30px;
  border-radius: var(--border-radius-large);
  background: linear-gradient(135deg, var(--surface-color), var(--primary-light));
}

.promotion-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-size: 1.5em;
  flex-shrink: 0;
}

.promotion-text {
  flex: 1;
}

.promotion-text h3 {
  margin: 0 0 8px 0;
  font-size: 1.4em;
  color: var(--text-color);
}

.promotion-text p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.promotion-btn {
  padding: 12px 25px;
  font-size: 1em;
  font-weight: bold;
  background: var(--primary-color);
  color: white;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.promotion-btn:hover {
  background: #0088bb;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 161, 214, 0.3);
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 20px 15px;
  }
  
  .welcome-section h1 {
    font-size: 2.5em;
  }
  
  .welcome-subtitle {
    font-size: 1.1em;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-actions .neu-button {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .user-greeting {
    flex-direction: column;
    text-align: center;
    padding: 25px 20px;
  }
  
  .user-avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.5em;
  }
  
  .greeting-text h2 {
    font-size: 1.5em;
  }
  
  .user-stats {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px 10px;
  }
  
  .stat-number {
    font-size: 2em;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .song-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .promotion-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 25px 20px;
  }
  
  .promotion-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .welcome-section h1 {
    font-size: 2em;
  }
  
  .section-title {
    font-size: 1.5em;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
  
  .song-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .feature-card {
    padding: 25px 15px;
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2em;
  }
}
</style>