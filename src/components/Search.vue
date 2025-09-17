<template>
  <div class="search-page page-container">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-box-large">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
          @input="onSearchInput"
          class="search-input-large" 
          placeholder="搜索音乐、歌手、专辑、歌单"
        />
        <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 搜索类型切换 -->
      <div class="search-tabs" v-if="searchKeyword">
        <span 
          v-for="tab in searchTabs" 
          :key="tab.type"
          class="search-tab" 
          :class="{ active: searchType === tab.type }"
          @click="switchSearchType(tab.type)"
        >
          {{ tab.name }}
          <span v-if="searchCounts[tab.type]" class="search-count">
            ({{ utils.formatPlayCount(searchCounts[tab.type]) }})
          </span>
        </span>
      </div>
    </div>

    <!-- 搜索内容区域 -->
    <div class="search-content">
      <!-- 搜索建议 -->
      <div v-if="!searchKeyword && !hasSearched" class="search-suggestions">
        <div class="hot-searches" v-if="hotSearches.length > 0">
          <h3>热门搜索</h3>
          <div class="hot-search-tags">
            <span 
              v-for="(item, index) in hotSearches" 
              :key="item.searchWord"
              class="hot-tag neu-button"
              @click="searchHotWord(item.searchWord)"
            >
              <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              {{ item.searchWord }}
            </span>
          </div>
        </div>

        <div class="search-history" v-if="searchHistory.length > 0">
          <div class="history-header">
            <h3>搜索历史</h3>
            <button class="clear-history-btn" @click="clearSearchHistory">
              <i class="fas fa-trash"></i>
              清空
            </button>
          </div>
          <div class="history-tags">
            <span 
              v-for="keyword in searchHistory" 
              :key="keyword"
              class="history-tag neu-button"
              @click="searchHotWord(keyword)"
            >
              {{ keyword }}
              <i class="fas fa-times remove-history" @click.stop="removeFromHistory(keyword)"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchKeyword" class="search-results">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>搜索中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">{{ error }}</div>
          <button class="error-retry neu-button" @click="handleSearch">
            <i class="fas fa-redo"></i>
            重试
          </button>
        </div>

        <!-- 搜索结果内容 -->
        <div v-else class="results-content">
          <!-- 单曲搜索结果 -->
          <div v-if="searchType === 1" class="songs-results">
            <div v-if="searchResults.songs.length === 0" class="no-results">
              <i class="fas fa-music"></i>
              <p>没有找到相关歌曲</p>
            </div>
            <div v-else class="song-list">
              <div 
                v-for="(song, index) in searchResults.songs" 
                :key="song.id"
                class="song-item neu-card"
                @dblclick="playSong(song)"
              >
                <div class="song-index">{{ index + 1 }}</div>
                <div class="song-cover">
                  <img :src="getSongCoverUrl(song, 100)" :alt="song.name" />
                  <div class="song-overlay">
                    <i class="fas fa-play" @click="playSong(song)"></i>
                  </div>
                </div>
                <div class="song-info">
                  <h4 class="song-name">{{ song.name }}</h4>
                  <p class="song-artist">{{ getArtistNames(song) }}</p>
                  <p class="song-album">{{ getAlbumName(song) }}</p>
                </div>
                <div class="song-actions">
                  <button class="action-btn" @click="playSong(song)" title="播放">
                    <i class="fas fa-play"></i>
                  </button>
                  <button class="action-btn" @click="addToPlaylist(song)" title="添加到播放列表">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button class="action-btn" @click="toggleLike(song)" title="收藏">
                    <i class="fas fa-heart" :class="{ liked: isLiked(song.id) }"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 歌手搜索结果 -->
          <div v-else-if="searchType === 100" class="artists-results">
            <div v-if="searchResults.artists.length === 0" class="no-results">
              <i class="fas fa-user-music"></i>
              <p>没有找到相关歌手</p>
            </div>
            <div v-else class="artist-grid">
              <div 
                v-for="artist in searchResults.artists" 
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
          </div>

          <!-- 专辑搜索结果 -->
          <div v-else-if="searchType === 10" class="albums-results">
            <div v-if="searchResults.albums.length === 0" class="no-results">
              <i class="fas fa-compact-disc"></i>
              <p>没有找到相关专辑</p>
            </div>
            <div v-else class="album-grid">
              <div 
                v-for="album in searchResults.albums" 
                :key="album.id"
                class="album-card neu-card"
                @click="openAlbum(album)"
              >
                <div class="album-cover">
                  <img :src="utils.getImageUrl(album.picUrl, 200)" :alt="album.name" />
                  <div class="album-overlay">
                    <i class="fas fa-play-circle"></i>
                  </div>
                </div>
                <div class="album-info">
                  <h3>{{ album.name }}</h3>
                  <p>{{ getArtistNames(album) }}</p>
                  <p class="album-date">{{ formatDate(album.publishTime) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 歌单搜索结果 -->
          <div v-else-if="searchType === 1000" class="playlists-results">
            <div v-if="searchResults.playlists.length === 0" class="no-results">
              <i class="fas fa-list-music"></i>
              <p>没有找到相关歌单</p>
            </div>
            <div v-else class="playlist-grid">
              <div 
                v-for="playlist in searchResults.playlists" 
                :key="playlist.id"
                class="playlist-card neu-card"
                @click="openPlaylist(playlist)"
              >
                <div class="playlist-cover">
                  <img :src="utils.getImageUrl(playlist.coverImgUrl, 200)" :alt="playlist.name" />
                  <div class="playlist-overlay">
                    <i class="fas fa-play-circle"></i>
                  </div>
                  <div class="play-count">
                    <i class="fas fa-headphones"></i>
                    {{ utils.formatPlayCount(playlist.playCount) }}
                  </div>
                </div>
                <div class="playlist-info">
                  <h3>{{ playlist.name }}</h3>
                  <p>by {{ playlist.creator?.nickname }}</p>
                  <p class="track-count">{{ playlist.trackCount }} 首歌曲</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="load-more" v-if="hasMore && searchResults[currentResultKey]?.length > 0">
            <button class="neu-button" @click="loadMore" :disabled="loadingMore">
              <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
              <i class="fas fa-chevron-down" v-else></i>
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="search-placeholder">
        <i class="fas fa-search"></i>
        <h3>发现你喜欢的音乐</h3>
        <p>搜索歌曲、歌手、专辑和歌单</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore, useUserStore, useAppStore } from '@/stores'
import { musicApi, utils } from '@/services'

// Router 和 Store
const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const searchKeyword = ref('')
const searchType = ref(1) // 1: 单曲, 100: 歌手, 10: 专辑, 1000: 歌单
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hasSearched = ref(false)
const hasMore = ref(false)
const offset = ref(0)

// 搜索结果
const searchResults = reactive({
  songs: [],
  artists: [],
  albums: [],
  playlists: []
})

// 搜索统计
const searchCounts = reactive({
  1: 0,
  100: 0,
  10: 0,
  1000: 0
})

// 热门搜索和历史
const hotSearches = ref([])
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

// 常量配置
const searchTabs = [
  { type: 1, name: '单曲' },
  { type: 100, name: '歌手' },
  { type: 10, name: '专辑' },
  { type: 1000, name: '歌单' }
]

// 计算属性
const currentResultKey = computed(() => {
  const keyMap = { 1: 'songs', 100: 'artists', 10: 'albums', 1000: 'playlists' }
  return keyMap[searchType.value]
})

// 防抖搜索
const debouncedSearch = utils.debounce((keyword) => {
  if (keyword.trim()) {
    handleSearch()
  }
}, 300)

// 方法
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  
  loading.value = true
  error.value = ''
  offset.value = 0
  hasSearched.value = true
  
  // 添加到搜索历史
  addToSearchHistory(keyword)
  
  try {
    const response = await musicApi.search(keyword, searchType.value, 30, 0)
    
    if (response.code === 200) {
      const resultKey = currentResultKey.value
      searchResults[resultKey] = response.result[resultKey] || []
      
      // 若是单曲搜索，为结果补全封面等详情
      if (searchType.value === 1 && searchResults.songs.length > 0) {
        await enrichSongsWithDetails(searchResults.songs)
      }
      
      // 更新搜索统计
      if (response.result[resultKey + 'Count']) {
        searchCounts[searchType.value] = response.result[resultKey + 'Count']
      }
      
      hasMore.value = searchResults[resultKey].length >= 30
    } else {
      throw new Error(response.message || '搜索失败')
    }
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = err.message || '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  try {
    offset.value += 30
    const response = await musicApi.search(searchKeyword.value, searchType.value, 30, offset.value)
    
    if (response.code === 200) {
      const resultKey = currentResultKey.value
      const newResults = response.result[resultKey] || []
      searchResults[resultKey].push(...newResults)
      if (searchType.value === 1 && newResults.length > 0) {
        await enrichSongsWithDetails(searchResults.songs)
      }
      hasMore.value = newResults.length >= 30
    }
  } catch (err) {
    appStore.showError('加载更多失败')
  } finally {
    loadingMore.value = false
  }
}

const switchSearchType = async (type) => {
  if (searchType.value === type) return
  
  searchType.value = type
  const resultKey = currentResultKey.value
  
  // 如果已经有结果则不重新搜索
  if (searchResults[resultKey].length === 0 && searchKeyword.value) {
    await handleSearch()
  }
}

const onSearchInput = () => {
  debouncedSearch(searchKeyword.value)
}

const clearSearch = () => {
  searchKeyword.value = ''
  error.value = ''
  hasSearched.value = false
  // 清空搜索结果
  Object.keys(searchResults).forEach(key => {
    searchResults[key] = []
  })
}

const searchHotWord = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

const addToSearchHistory = (keyword) => {
  const history = searchHistory.value
  const index = history.indexOf(keyword)
  
  if (index > -1) {
    history.splice(index, 1)
  }
  
  history.unshift(keyword)
  
  // 限制历史记录数量
  if (history.length > 10) {
    history.pop()
  }
  
  searchHistory.value = history
  localStorage.setItem('searchHistory', JSON.stringify(history))
}

const removeFromHistory = (keyword) => {
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }
}

const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

const getArtistNames = (item) => {
  if (!item?.artists && !item?.artist) return '未知歌手'
  const artists = item.artists || (item.artist ? [item.artist] : [])
  return artists.map(artist => artist.name).join(' / ')
}

const getAlbumName = (song) => {
  return song?.album?.name || song?.al?.name || '未知专辑'
}

const getSongCoverUrl = (song, size = 100) => {
  const url = song?.album?.picUrl || song?.al?.picUrl || song?.picUrl
  return utils.getImageUrl(url, size)
}

// 使用 song/detail 批量补全封面信息
const enrichSongsWithDetails = async (songs) => {
  try {
    const ids = songs.map(s => s.id).filter(Boolean)
    if (ids.length === 0) return
    const detailRes = await musicApi.getSongDetail(ids)
    if (detailRes.code === 200 && Array.isArray(detailRes.songs)) {
      const idToDetail = new Map(detailRes.songs.map(s => [s.id, s]))
      songs.forEach((s, idx) => {
        const d = idToDetail.get(s.id)
        if (d) {
          // 对齐字段，便于现有渲染函数复用
          songs[idx] = {
            ...s,
            al: d.al || s.al,
            album: s.album || { name: d.al?.name, picUrl: d.al?.picUrl },
            dt: d.dt ?? s.dt,
          }
        }
      })
    }
  } catch (e) {
    // 静默失败，不阻塞搜索
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).getFullYear() + '年'
}

const isLiked = (songId) => {
  return userStore.isLiked(songId)
}

const playSong = async (song) => {
  try {
    await playerStore.playSong(song, [song], 0)
    appStore.showSuccess(`开始播放: ${song.name}`)
  } catch (error) {
    appStore.showError('播放失败')
  }
}

const addToPlaylist = (song) => {
  playerStore.addToPlaylist(song)
  appStore.showSuccess(`已添加到播放列表: ${song.name}`)
}

const toggleLike = async (song) => {
  if (!userStore.isLoggedIn) {
    appStore.showError('请先登录')
    return
  }
  
  try {
    const isCurrentlyLiked = isLiked(song.id)
    await musicApi.likeSong(song.id, !isCurrentlyLiked)
    
    if (isCurrentlyLiked) {
      const index = userStore.likeList.indexOf(song.id)
      if (index > -1) userStore.likeList.splice(index, 1)
    } else {
      userStore.likeList.push(song.id)
    }
    
    appStore.showSuccess(isCurrentlyLiked ? '已取消喜欢' : '已添加到我喜欢的音乐')
  } catch (error) {
    appStore.showError('操作失败')
  }
}

const openArtist = (artist) => {
  appStore.showArtistModal(artist.id)
}

const openAlbum = async (album) => {
  try {
    const res = await musicApi.getAlbumDetail(album.id)
    if (res.code === 200) {
      const songs = res.songs || []
      if (songs.length > 0) {
        playerStore.setPlaylist(songs, 0)
        appStore.showSuccess('已加载专辑，前往正在播放查看')
        router.push({ name: 'NowPlaying' })
      } else {
        appStore.showInfo('该专辑暂无可播放歌曲')
      }
    }
  } catch (error) {
    appStore.showError('打开专辑失败')
  }
}

const openPlaylist = (playlist) => {
  appStore.showPlaylistModal(playlist.id)
}

const loadHotSearches = async () => {
  try {
    const response = await musicApi.getSearchHot()
    if (response.code === 200) {
      hotSearches.value = response.result.hots || []
    }
  } catch (error) {
    console.error('加载热门搜索失败:', error)
  }
}

// 监听路由参数
watch(() => route.query.q, (newKeyword) => {
  if (newKeyword && newKeyword !== searchKeyword.value) {
    searchKeyword.value = newKeyword
    handleSearch()
  }
}, { immediate: true })

// 组件挂载
onMounted(() => {
  loadHotSearches()
  
  // 如果有搜索关键词则自动搜索
  const keyword = route.query.q
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})
</script>

<style scoped>
.search-page {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 搜索头部 */
.search-header {
  margin-bottom: 40px;
}

.search-box-large {
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 18px;
  z-index: 2;
}

.search-input-large {
  width: 100%;
  height: 60px;
  padding: 0 60px 0 60px;
  border: none;
  border-radius: 30px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
  font-size: 16px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.search-input-large:focus {
  outline: none;
  box-shadow: var(--neu-shadow-inset-active);
}

.clear-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  color: var(--primary-color);
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-small);
}

/* 搜索标签 */
.search-tabs {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.search-tab {
  padding: 12px 24px;
  border-radius: 25px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-tab:hover {
  box-shadow: var(--neu-shadow-hover);
  color: var(--text-primary);
}

.search-tab.active {
  box-shadow: var(--neu-shadow-inset);
  color: var(--primary-color);
  font-weight: 500;
}

.search-count {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 搜索内容区域 */
.search-content {
  min-height: 400px;
}

/* 搜索建议 */
.search-suggestions {
  padding: 20px 0;
}

.hot-searches,
.search-history {
  margin-bottom: 40px;
}

.hot-searches h3,
.search-history h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.clear-history-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border: none;
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  box-shadow: var(--neu-shadow-hover);
  color: var(--danger-color);
}

.hot-search-tags,
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hot-tag,
.history-tag {
  position: relative;
  padding: 10px 16px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hot-tag:hover,
.history-tag:hover {
  box-shadow: var(--neu-shadow-hover);
  color: var(--primary-color);
}

.hot-rank {
  background: var(--text-secondary);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.hot-rank.top {
  background: var(--primary-color);
}

.remove-history {
  color: var(--text-secondary);
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.history-tag:hover .remove-history {
  opacity: 1;
}

.remove-history:hover {
  color: var(--danger-color);
}

/* 搜索结果 */
.results-content {
  padding: 20px 0;
}

/* 加载和错误状态 */
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  font-size: 16px;
  margin-bottom: 20px;
}

.error-retry {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 无结果状态 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-results i {
  font-size: 3em;
  margin-bottom: 20px;
  color: var(--text-muted);
}

.no-results p {
  font-size: 16px;
}

/* 歌曲列表 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.song-item:hover {
  box-shadow: var(--neu-shadow-hover);
}

.song-index {
  width: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-weight: 500;
}

.song-cover {
  position: relative;
  width: 60px;
  height: 60px;
  margin-right: 16px;
  border-radius: 8px;
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
  font-size: 20px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist,
.song-album {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
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
}

.action-btn:hover {
  box-shadow: var(--neu-shadow-hover-small);
  color: var(--primary-color);
}

.action-btn i.liked {
  color: var(--danger-color);
}

/* 歌手网格 */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.artist-card {
  padding: 20px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.artist-card:hover {
  box-shadow: var(--neu-shadow-hover);
}

.artist-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.artist-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* 专辑网格 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.album-card {
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.album-card:hover {
  box-shadow: var(--neu-shadow-hover);
}

.album-cover {
  position: relative;
  width: 100%;
  height: 200px;
  background: var(--neu-bg);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-overlay {
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

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-overlay i {
  color: white;
  font-size: 32px;
}

.album-info {
  padding: 16px;
}

.album-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-date {
  font-size: 12px !important;
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  box-shadow: var(--neu-shadow-hover);
}

.playlist-cover {
  position: relative;
  width: 100%;
  height: 220px;
  background: var(--neu-bg);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: white;
  font-size: 32px;
}

.play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.playlist-info {
  padding: 16px;
}

.playlist-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-info p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-count {
  font-size: 12px !important;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin: 40px 0;
}

.load-more .neu-button {
  padding: 12px 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 空状态 */
.search-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.search-placeholder i {
  font-size: 3em;
  margin-bottom: 20px;
  color: var(--text-muted);
}

.search-placeholder h3 {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.search-placeholder p {
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-page {
    padding: 20px 16px;
  }
  
  .search-tabs {
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .search-tab {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .artist-grid,
  .album-grid,
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .song-item {
    padding: 12px;
  }
  
  .song-cover {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }
  
  .song-name {
    font-size: 15px;
  }
  
  .song-artist,
  .song-album {
    font-size: 13px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
}
</style>