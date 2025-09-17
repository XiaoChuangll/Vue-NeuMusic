<template>
  <div class="discover-page page-container">
    <!-- 页面头部 -->
    <div class="discover-header">
      <h1>发现音乐</h1>
      <div class="discover-tabs">
        <span 
          v-for="tab in tabs" 
          :key="tab.key"
          class="discover-tab" 
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
      <button class="error-retry neu-button" @click="loadData">
        <i class="fas fa-redo"></i>
        重试
      </button>
    </div>

    <!-- 内容区域 -->
    <div v-else class="discover-content">
      <!-- 个性推荐 -->
      <div v-if="activeTab === 'recommend'" class="discover-section">
        <!-- 轮播图 -->
        <div class="banner-section" v-if="banners.length > 0">
          <h2 class="section-title">精选推荐</h2>
          <div class="banner-container">
            <div 
              v-for="(banner, index) in banners" 
              :key="banner.bannerId"
              class="banner-item neu-card"
              :class="{ active: currentBanner === index }"
              @click="handleBannerClick(banner)"
            >
              <img :src="utils.getImageUrl(banner.pic, 600)" :alt="banner.typeTitle" />
              <div class="banner-info">
                <h3>{{ banner.typeTitle }}</h3>
              </div>
            </div>
          </div>
          <div class="banner-dots">
            <span 
              v-for="(banner, index) in banners" 
              :key="index"
              class="dot"
              :class="{ active: currentBanner === index }"
              @click="currentBanner = index"
            ></span>
          </div>
        </div>

        <!-- 推荐歌单 -->
        <div class="playlist-section">
          <h2 class="section-title">推荐歌单</h2>
          <div class="playlist-grid">
            <div 
              v-for="playlist in recommendPlaylists" 
              :key="playlist.id"
              class="playlist-card neu-card"
              @click="openPlaylist(playlist)"
            >
              <div class="card-cover">
                <img :src="utils.getImageUrl(playlist.picUrl, 300)" :alt="playlist.name" />
                <div class="card-play-icon">
                  <i class="fas fa-play-circle"></i>
                </div>
                <div class="play-count">
                  <i class="fas fa-headphones"></i>
                  {{ utils.formatPlayCount(playlist.playCount) }}
                </div>
              </div>
              <div class="playlist-info">
                <h3 class="playlist-name">{{ playlist.name }}</h3>
                <p class="playlist-desc">{{ playlist.copywriter || '精选歌单' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 新歌速递 -->
        <div class="newsong-section">
          <h2 class="section-title">新歌速递</h2>
          <div class="song-list">
            <div 
              v-for="(song, index) in newSongs" 
              :key="song.id"
              class="song-item neu-card"
            >
              <div class="song-index">{{ index + 1 }}</div>
              <div class="song-cover">
                <img :src="utils.getImageUrl(song.picUrl, 100)" :alt="song.name" />
              </div>
              <div class="song-info">
                <h4 class="song-name">{{ song.name }}</h4>
                <p class="song-artist">{{ getArtistNames(song.song) }}</p>
              </div>
              <div class="song-actions">
                <button class="action-btn" @click="playSong(song)" title="播放">
                  <i class="fas fa-play"></i>
                </button>
                <button class="action-btn" @click="addToPlaylist(song)" title="添加到播放列表">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌单分类 -->
      <div v-else-if="activeTab === 'playlist'" class="discover-section">
        <!-- 歌单分类标签 -->
        <div class="category-tabs">
          <span 
            v-for="category in playlistCategories" 
            :key="category.name"
            class="category-tab neu-button"
            :class="{ active: selectedCategory === category.name }"
            @click="selectCategory(category.name)"
          >
            {{ category.name }}
          </span>
        </div>

        <!-- 歌单列表 -->
        <div class="playlist-grid">
          <div 
            v-for="playlist in categoryPlaylists" 
            :key="playlist.id"
            class="playlist-card neu-card"
            @click="openPlaylist(playlist)"
          >
            <div class="card-cover">
              <img :src="utils.getImageUrl(playlist.coverImgUrl, 300)" :alt="playlist.name" />
              <div class="card-play-icon">
                <i class="fas fa-play-circle"></i>
              </div>
              <div class="play-count">
                <i class="fas fa-headphones"></i>
                {{ utils.formatPlayCount(playlist.playCount) }}
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-creator">by {{ playlist.creator?.nickname }}</p>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMorePlaylists">
          <button class="neu-button" @click="loadMorePlaylists" :disabled="loadingMore">
            <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
            <i class="fas fa-chevron-down" v-else></i>
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>

      <!-- 排行榜 -->
      <div v-else-if="activeTab === 'rank'" class="discover-section">
        <div class="rank-grid">
          <div 
            v-for="rank in rankLists" 
            :key="rank.id"
            class="rank-card neu-card"
            @click="openRankList(rank)"
          >
            <div class="rank-cover">
              <img :src="utils.getImageUrl(rank.coverImgUrl, 300)" :alt="rank.name" />
              <div class="rank-update">{{ rank.updateFrequency }}</div>
            </div>
            <div class="rank-info">
              <h3>{{ rank.name }}</h3>
              <div class="rank-songs">
                <div 
                  v-for="(track, index) in rank.tracks?.slice(0, 3)" 
                  :key="getTrackKey(track, index)"
                  class="rank-song"
                >
                  <span class="rank-number">{{ index + 1 }}</span>
                  <span class="rank-song-name">{{ getTrackName(track) }}</span>
                  <span class="rank-artist">{{ getTrackArtist(track) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌手分类 -->
      <div v-else-if="activeTab === 'artist'" class="discover-section">
        <!-- 歌手分类 -->
        <div class="artist-categories">
          <div class="category-group">
            <h3>语种</h3>
            <div class="category-options">
              <span 
                v-for="lang in artistLanguages" 
                :key="lang.value"
                class="category-option neu-button"
                :class="{ active: selectedArtistFilters.area === lang.value }"
                @click="selectArtistFilter('area', lang.value)"
              >
                {{ lang.label }}
              </span>
            </div>
          </div>
          <div class="category-group">
            <h3>分类</h3>
            <div class="category-options">
              <span 
                v-for="type in artistTypes" 
                :key="type.value"
                class="category-option neu-button"
                :class="{ active: selectedArtistFilters.type === type.value }"
                @click="selectArtistFilter('type', type.value)"
              >
                {{ type.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- 歌手列表 -->
        <div class="artist-grid">
          <div 
            v-for="artist in artists" 
            :key="artist.id"
            class="artist-card neu-card"
            @click="openArtist(artist)"
          >
            <div class="artist-avatar">
              <img :src="utils.getImageUrl(artist.img1v1Url, 200)" :alt="artist.name" />
            </div>
            <div class="artist-info">
              <h3>{{ artist.name }}</h3>
              <p v-if="artist.alias && artist.alias.length > 0">{{ artist.alias[0] }}</p>
            </div>
          </div>
        </div>

        <!-- 加载更多歌手 -->
        <div class="load-more" v-if="hasMoreArtists">
          <button class="neu-button" @click="loadMoreArtists" :disabled="loadingMore">
            <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
            <i class="fas fa-chevron-down" v-else></i>
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { usePlayerStore, useAppStore } from '@/stores'
import { musicApi, utils } from '@/services'

// Store 实例
const playerStore = usePlayerStore()
const appStore = useAppStore()

// 响应式数据
const loading = ref(false)
const error = ref('')
const activeTab = ref('recommend')
const currentBanner = ref(0)
const selectedCategory = ref('全部')
const loadingMore = ref(false)

// 数据状态
const banners = ref([])
const recommendPlaylists = ref([])
const newSongs = ref([])
const categoryPlaylists = ref([])
const rankLists = ref([])
const artists = ref([])

// 分页状态
const playlistOffset = ref(0)
const artistOffset = ref(0)
const hasMorePlaylists = ref(true)
const hasMoreArtists = ref(true)

// 筛选状态
const selectedArtistFilters = reactive({
  area: -1,
  type: -1
})

// 常量配置
const tabs = [
  { key: 'recommend', name: '个性推荐' },
  { key: 'playlist', name: '歌单' },
  { key: 'rank', name: '排行榜' },
  { key: 'artist', name: '歌手' }
]

const playlistCategories = [
  { name: '全部' },
  { name: '华语' },
  { name: '欧美' },
  { name: '日语' },
  { name: '韩语' },
  { name: '民谣' },
  { name: '电子' },
  { name: '摇滚' }
]

const artistLanguages = [
  { label: '全部', value: -1 },
  { label: '华语', value: 7 },
  { label: '欧美', value: 96 },
  { label: '日本', value: 8 },
  { label: '韩国', value: 16 },
  { label: '其他', value: 0 }
]

const artistTypes = [
  { label: '全部', value: -1 },
  { label: '男歌手', value: 1 },
  { label: '女歌手', value: 2 },
  { label: '乐队', value: 3 }
]

// 方法
const switchTab = async (tab) => {
  activeTab.value = tab
  await loadData()
}

const loadData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    switch (activeTab.value) {
      case 'recommend':
        await loadRecommendData()
        break
      case 'playlist':
        await loadPlaylistData()
        break
      case 'rank':
        await loadRankData()
        break
      case 'artist':
        await loadArtistData()
        break
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const loadRecommendData = async () => {
  const [bannerRes, playlistRes, newSongRes] = await Promise.all([
    musicApi.getBanner().catch(() => ({ banners: [] })),
    musicApi.getPersonalized(12).catch(() => ({ result: [] })),
    musicApi.getPersonalizedNewsong(10).catch(() => ({ result: [] }))
  ])
  
  banners.value = bannerRes.banners || []
  recommendPlaylists.value = playlistRes.result || []
  newSongs.value = newSongRes.result || []
}

const loadPlaylistData = async () => {
  playlistOffset.value = 0
  const cat = selectedCategory.value === '全部' ? '' : selectedCategory.value
  const response = await musicApi.getTopPlaylists(cat, 50, 0)
  categoryPlaylists.value = response.playlists || []
  hasMorePlaylists.value = response.more
}

const loadRankData = async () => {
  const response = await musicApi.getToplistDetail()
  rankLists.value = response.list || []
}

const loadArtistData = async () => {
  artistOffset.value = 0
  const response = await musicApi.getTopArtists({
    area: selectedArtistFilters.area,
    type: selectedArtistFilters.type,
    limit: 50,
    offset: 0
  })
  artists.value = response.artists || []
  hasMoreArtists.value = response.more
}

const selectCategory = async (category) => {
  selectedCategory.value = category
  await loadPlaylistData()
}

const selectArtistFilter = async (filterType, value) => {
  selectedArtistFilters[filterType] = value
  await loadArtistData()
}

const loadMorePlaylists = async () => {
  if (loadingMore.value || !hasMorePlaylists.value) return
  
  loadingMore.value = true
  try {
    playlistOffset.value += 50
    const cat = selectedCategory.value === '全部' ? '' : selectedCategory.value
    const response = await musicApi.getTopPlaylists(cat, 50, playlistOffset.value)
    categoryPlaylists.value.push(...(response.playlists || []))
    hasMorePlaylists.value = response.more
  } catch (err) {
    appStore.showError('加载更多歌单失败')
  } finally {
    loadingMore.value = false
  }
}

const loadMoreArtists = async () => {
  if (loadingMore.value || !hasMoreArtists.value) return
  
  loadingMore.value = true
  try {
    artistOffset.value += 50
    const response = await musicApi.getTopArtists({
      area: selectedArtistFilters.area,
      type: selectedArtistFilters.type,
      limit: 50,
      offset: artistOffset.value
    })
    artists.value.push(...(response.artists || []))
    hasMoreArtists.value = response.more
  } catch (err) {
    appStore.showError('加载更多歌手失败')
  } finally {
    loadingMore.value = false
  }
}

const getArtistNames = (item) => {
  // 兼容不同数据结构：rank.tracks、newSongs、通用歌曲对象等
  if (item?.ar && Array.isArray(item.ar)) {
    return item.ar.map(a => a.name).join(' / ')
  }
  if (item?.artists && Array.isArray(item.artists)) {
    return item.artists.map(a => a.name).join(' / ')
  }
  if (item?.song?.artists && Array.isArray(item.song.artists)) {
    return item.song.artists.map(a => a.name).join(' / ')
  }
  if (item?.simpleSong?.ar && Array.isArray(item.simpleSong.ar)) {
    return item.simpleSong.ar.map(a => a.name).join(' / ')
  }
  return '未知歌手'
}

// 处理排行榜 tracks 的不同结构：部分接口返回 { first, second } 字段
const getTrackName = (track) => {
  if (!track) return ''
  if (typeof track.first === 'string') return track.first
  if (track.name) return track.name
  if (track.simpleSong?.name) return track.simpleSong.name
  return ''
}

const getTrackArtist = (track) => {
  if (!track) return ''
  if (typeof track.second === 'string') return track.second
  if (track.simpleSong) return getArtistNames(track.simpleSong)
  return getArtistNames(track)
}

const getTrackKey = (track, index) => {
  return track?.id || track?.simpleSong?.id || `${index}-${getTrackName(track)}`
}

const handleBannerClick = (banner) => {
  // 处理轮播图点击事件
  console.log('点击轮播图:', banner)
}

const openPlaylist = (playlist) => {
  // 打开歌单详情并设置当前歌单ID
  if (playlist?.id) {
    appStore.showPlaylistModal(playlist.id)
  } else {
    appStore.showModal('playlistModal')
  }
  console.log('打开歌单:', playlist)
}

const openRankList = (rank) => {
  // 排行榜也是一个歌单，直接打开歌单模态
  if (rank?.id) {
    appStore.showPlaylistModal(rank.id)
  } else {
    console.log('打开排行榜:', rank)
  }
}

const openArtist = (artist) => {
  // 打开歌手详情
  appStore.showModal('artistModal')
  console.log('打开歌手:', artist)
}

const playSong = async (songData) => {
  try {
    // 获取歌曲详情
    const response = await musicApi.getSongDetail(songData.id)
    if (response.code === 200 && response.songs.length > 0) {
      const song = response.songs[0]
      await playerStore.playSong(song, [song], 0)
      appStore.showSuccess(`开始播放: ${song.name}`)
    }
  } catch (err) {
    appStore.showError('播放失败')
  }
}

const addToPlaylist = async (songData) => {
  try {
    const response = await musicApi.getSongDetail(songData.id)
    if (response.code === 200 && response.songs.length > 0) {
      const song = response.songs[0]
      playerStore.addToPlaylist(song)
      appStore.showSuccess(`已添加到播放列表: ${song.name}`)
    }
  } catch (err) {
    appStore.showError('添加失败')
  }
}

// 轮播图自动切换
let bannerTimer = null
const startBannerTimer = () => {
  if (bannerTimer) clearInterval(bannerTimer)
  bannerTimer = setInterval(() => {
    if (banners.value.length > 1) {
      currentBanner.value = (currentBanner.value + 1) % banners.value.length
    }
  }, 5000)
}

const stopBannerTimer = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

// 监听轮播图数据变化
watch(banners, (newBanners) => {
  if (newBanners.length > 1) {
    startBannerTimer()
  } else {
    stopBannerTimer()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadData()
})

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopBannerTimer()
})
</script>

<style scoped>
/* 发现页面样式 */
.discover-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.discover-header {
  margin-bottom: 30px;
}

.discover-header h1 {
  font-size: 2.5em;
  color: var(--text-color);
  margin-bottom: 20px;
}

.discover-tabs {
  display: flex;
  border-bottom: 2px solid var(--shadow-dark);
  gap: 10px;
}

.discover-tab {
  padding: 12px 24px;
  cursor: pointer;
  font-weight: bold;
  color: var(--text-secondary);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.discover-tab.active {
  color: var(--primary-color);
  background: var(--surface-color);
  box-shadow: var(--neu-shadow);
}

.discover-tab:hover:not(.active) {
  color: var(--primary-color);
  background: var(--primary-light);
}

/* 加载和错误状态 */
.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-retry {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 1em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 区块标题 */
.section-title {
  font-size: 1.8em;
  color: var(--text-color);
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--primary-color);
  display: inline-block;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 40px;
}

.banner-container {
  position: relative;
  height: 200px;
  border-radius: var(--border-radius-large);
  overflow: hidden;
  box-shadow: var(--neu-shadow);
}

.banner-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.banner-item.active {
  opacity: 1;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 30px 20px 15px;
}

.banner-info h3 {
  font-size: 1.5em;
  margin: 0;
}

.banner-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--shadow-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-large);
  overflow: hidden;
}

.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--neu-shadow-hover);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .card-cover img {
  transform: scale(1.1);
}

.card-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3em;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .card-play-icon {
  opacity: 0.9;
}

.play-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.playlist-info {
  padding: 15px;
}

.playlist-name {
  font-size: 1em;
  font-weight: bold;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-desc,
.playlist-creator {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 新歌列表 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  transform: translateX(5px);
  box-shadow: var(--neu-shadow-hover);
}

.song-index {
  width: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 1.2em;
  color: var(--text-secondary);
}

.song-cover {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin: 0 15px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-color);
  box-shadow: var(--neu-shadow);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: var(--primary-color);
  box-shadow: var(--neu-shadow-hover);
  transform: translateY(-2px);
}

/* 分类标签 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.category-tab {
  padding: 8px 16px;
  font-size: 0.9em;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 161, 214, 0.3);
}

/* 歌手分类 */
.artist-categories {
  margin-bottom: 30px;
}

.category-group {
  margin-bottom: 20px;
}

.category-group h3 {
  margin: 0 0 10px 0;
  color: var(--text-color);
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-option {
  padding: 6px 12px;
  font-size: 0.85em;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-option.active {
  background: var(--primary-color);
  color: white;
}

/* 歌手网格 */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.artist-card {
  text-align: center;
  padding: 20px;
  border-radius: var(--border-radius-large);
  cursor: pointer;
  transition: all 0.3s ease;
}

.artist-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--neu-shadow-hover);
}

.artist-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 15px;
  box-shadow: var(--neu-shadow);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info h3 {
  margin: 0 0 5px 0;
  font-size: 1em;
}

.artist-info p {
  margin: 0;
  font-size: 0.8em;
  color: var(--text-secondary);
}

/* 排行榜 */
.rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.rank-card {
  display: flex;
  padding: 20px;
  border-radius: var(--border-radius-large);
  cursor: pointer;
  transition: all 0.3s ease;
}

.rank-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--neu-shadow-hover);
}

.rank-cover {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
}

.rank-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-update {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px;
  font-size: 0.7em;
  text-align: center;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.1em;
}

.rank-songs {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rank-song {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
}

.rank-number {
  width: 20px;
  color: var(--primary-color);
  font-weight: bold;
}

.rank-song-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-artist {
  color: var(--text-secondary);
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin: 30px 0;
}

.load-more .neu-button {
  padding: 12px 30px;
  font-size: 1em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .discover-page {
    padding: 15px;
  }
  
  .discover-header h1 {
    font-size: 2em;
  }
  
  .discover-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .discover-tab {
    white-space: nowrap;
    padding: 10px 16px;
  }
  
  .banner-container {
    height: 150px;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .card-cover {
    height: 150px;
  }
  
  .song-item {
    padding: 10px;
  }
  
  .song-cover {
    width: 50px;
    height: 50px;
    margin: 0 10px;
  }
  
  .artist-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .artist-avatar {
    width: 80px;
    height: 80px;
  }
  
  .rank-grid {
    grid-template-columns: 1fr;
  }
  
  .rank-card {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.4em;
  }
  
  .banner-container {
    height: 120px;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
  
  .card-cover {
    height: 130px;
  }
  
  .song-index {
    width: 30px;
    font-size: 1em;
  }
  
  .song-cover {
    width: 40px;
    height: 40px;
    margin: 0 8px;
  }
  
  .category-tabs,
  .category-options {
    gap: 6px;
  }
}
</style>