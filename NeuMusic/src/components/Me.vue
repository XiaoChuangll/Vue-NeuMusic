<template>
  <div class="me-page page-container">
    <!-- 未登录状态 -->
    <div v-if="!userStore.isLoggedIn" class="not-logged-in">
      <div class="login-prompt">
        <i class="fas fa-user-circle"></i>
        <h2>享受更多音乐体验</h2>
        <p>登录后即可同步歌单、收藏音乐、获取个性化推荐</p>
        
        <div class="login-actions">
          <router-link to="/login" class="neu-button primary">
            <i class="fas fa-sign-in-alt"></i>
            立即登录
          </router-link>
          <button class="neu-button" @click="continueAsGuest">
            <i class="fas fa-eye"></i>
            继续浏览
          </button>
        </div>
        
        <div class="guest-features">
          <h3>游客模式也可以：</h3>
          <ul>
            <li><i class="fas fa-search"></i> 搜索音乐和歌手</li>
            <li><i class="fas fa-play"></i> 播放部分歌曲</li>
            <li><i class="fas fa-compass"></i> 浏览热门内容</li>
            <li><i class="fas fa-list"></i> 查看排行榜</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 已登录状态 -->
    <div v-else class="user-profile">
      <div class="profile-header">
        <h1>我的音乐</h1>
        <div class="user-info">
          <div class="user-avatar-container">
            <img 
              v-if="userStore.avatarUrl" 
              :src="userStore.avatarUrl" 
              :alt="userStore.nickname"
              class="user-avatar-large"
            />
            <div v-else class="default-avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <div class="user-details">
            <h2>{{ userStore.nickname || '用户' }}</h2>
            <p v-if="userStore.userId">用户ID: {{ userStore.userId }}</p>
            <p v-if="userStore.userDetail?.profile?.signature" class="user-signature">
              {{ userStore.userDetail.profile.signature }}
            </p>
            <div class="user-badges">
              <span class="badge online">
                <i class="fas fa-circle"></i>
                在线
              </span>
            </div>
          </div>
          <div class="profile-actions">
            <button class="neu-button" @click="refreshUserData">
              <i class="fas fa-sync-alt"></i>
              刷新
            </button>
            <button class="neu-button" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              退出
            </button>
          </div>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <h3>{{ userStore.createdPlaylists.length }}</h3>
          <p>创建的歌单</p>
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="stat-item">
          <h3>{{ userStore.subscribedPlaylists.length }}</h3>
          <p>收藏的歌单</p>
          <i class="fas fa-heart-circle"></i>
        </div>
        <div class="stat-item">
          <h3>{{ userStore.likedSongs.length }}</h3>
          <p>喜欢的音乐</p>
          <i class="fas fa-music"></i>
        </div>
      </div>
      
      <div class="user-content">
        <!-- 功能快捷选项 -->
        <div class="quick-actions">
          <h3>快捷操作</h3>
          <div class="action-grid">
            <div class="action-item neu-card" @click="goToRecentlyPlayed">
              <i class="fas fa-history"></i>
              <span>最近播放</span>
            </div>
            <div class="action-item neu-card" @click="goToLikedMusic">
              <i class="fas fa-heart"></i>
              <span>我喜欢的音乐</span>
            </div>
            <div class="action-item neu-card" @click="goToDownloads">
              <i class="fas fa-download"></i>
              <span>下载管理</span>
            </div>
            <div class="action-item neu-card" @click="goToLocalMusic">
              <i class="fas fa-folder-music"></i>
              <span>本地音乐</span>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-header">
            <h3>创建的歌单</h3>
            <button v-if="userStore.createdPlaylists.length > 6" class="view-all-btn neu-button" @click="viewAllCreatedPlaylists">
              查看全部
            </button>
          </div>
          <div v-if="userStore.createdPlaylists.length === 0" class="empty-state">
            <i class="fas fa-folder-plus"></i>
            <p>还没有创建任何歌单</p>
            <button class="neu-button primary" @click="createNewPlaylist">
              <i class="fas fa-plus"></i>
              创建歌单
            </button>
          </div>
          <div v-else class="playlist-grid">
            <div 
              v-for="playlist in userStore.createdPlaylists.slice(0, 6)" 
              :key="playlist.id"
              class="playlist-card neu-card"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img :src="utils.getImageUrl(playlist.coverImgUrl, 200)" :alt="playlist.name" />
                <div class="playlist-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              <div class="playlist-info">
                <h4>{{ playlist.name }}</h4>
                <p>{{ playlist.trackCount }} 首歌曲</p>
                <div class="playlist-meta">
                  <span class="creation-time">创建于 {{ formatDate(playlist.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-header">
            <h3>收藏的歌单</h3>
            <button v-if="userStore.subscribedPlaylists.length > 6" class="view-all-btn neu-button" @click="viewAllSubscribedPlaylists">
              查看全部
            </button>
          </div>
          <div v-if="userStore.subscribedPlaylists.length === 0" class="empty-state">
            <i class="fas fa-heart"></i>
            <p>还没有收藏任何歌单</p>
            <button class="neu-button" @click="goToDiscover">
              <i class="fas fa-compass"></i>
              去发现音乐
            </button>
          </div>
          <div v-else class="playlist-grid">
            <div 
              v-for="playlist in userStore.subscribedPlaylists.slice(0, 6)" 
              :key="playlist.id"
              class="playlist-card neu-card"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img :src="utils.getImageUrl(playlist.coverImgUrl, 200)" :alt="playlist.name" />
                <div class="playlist-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              <div class="playlist-info">
                <h4>{{ playlist.name }}</h4>
                <p>by {{ playlist.creator?.nickname }}</p>
                <div class="playlist-meta">
                  <span class="subscriber-count">{{ formatPlayCount(playlist.subscribedCount) }} 人收藏</span>
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
import { useRouter } from 'vue-router'
import { useUserStore, useAppStore } from '@/stores'
import { utils } from '@/services'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 方法
const continueAsGuest = () => {
  router.push('/')
}

const refreshUserData = async () => {
  try {
    appStore.setLoading(true)
    await Promise.all([
      userStore.fetchUserDetail(),
      userStore.fetchUserPlaylists(),
      userStore.fetchLikeList()
    ])
    appStore.showSuccess('刷新成功')
  } catch (error) {
    appStore.showError('刷新失败')
  } finally {
    appStore.setLoading(false)
  }
}

const logout = async () => {
  try {
    appStore.setLoading(true)
    await userStore.logout()
    appStore.showSuccess('已退出登录')
    router.push('/')
  } catch (error) {
    appStore.showError('退出登录失败')
  } finally {
    appStore.setLoading(false)
  }
}

const openPlaylist = (playlist) => {
  appStore.showPlaylistModal(playlist.id)
}

// 新增方法
const goToRecentlyPlayed = () => {
  // TODO: 实现最近播放功能
  appStore.showInfo('最近播放功能即将上线')
}

const goToLikedMusic = () => {
  // TODO: 实现我喜欢的音乐功能
  appStore.showInfo('我喜欢的音乐功能即将上线')
}

const goToDownloads = () => {
  // TODO: 实现下载管理功能
  appStore.showInfo('下载管理功能即将上线')
}

const goToLocalMusic = () => {
  // TODO: 实现本地音乐功能
  appStore.showInfo('本地音乐功能即将上线')
}

const createNewPlaylist = () => {
  // TODO: 实现创建歌单功能
  appStore.showInfo('创建歌单功能即将上线')
}

const goToDiscover = () => {
  router.push('/discover')
}

const viewAllCreatedPlaylists = () => {
  // TODO: 实现查看全部歌单功能
  appStore.showInfo('查看全部歌单功能即将上线')
}

const viewAllSubscribedPlaylists = () => {
  // TODO: 实现查看全部歌单功能
  appStore.showInfo('查看全部歌单功能即将上线')
}

// 工具方法
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月'
}

const formatPlayCount = (count) => {
  if (count > 100000) {
    return Math.floor(count / 10000) + '万'
  } else if (count > 1000) {
    return Math.floor(count / 1000) + '千'
  }
  return count.toString()
}
</script>

<style scoped>
.me-page {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 未登录状态 */
.not-logged-in {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.login-prompt {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: var(--neu-bg);
  border-radius: 20px;
  box-shadow: var(--neu-shadow);
}

.login-prompt i {
  font-size: 4em;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.login-prompt h2 {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.login-prompt p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 30px 0;
}

.login-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.login-actions .neu-button {
  flex: 1;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.login-actions .neu-button.primary {
  background: var(--primary-color);
  color: white;
}

.guest-features {
  text-align: left;
}

.guest-features h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.guest-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guest-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.guest-features li i {
  color: var(--primary-color);
  width: 16px;
}

/* 已登录状态 */
.profile-header {
  margin-bottom: 40px;
}

.profile-header h1 {
  font-size: 28px;
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow);
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--neu-shadow-small);
}

.default-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 32px;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.user-details p {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.user-signature {
  font-style: italic;
  color: var(--text-secondary) !important;
}

.user-badges {
  margin-top: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge.online {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.badge.online i {
  font-size: 8px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-actions .neu-button {
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* 统计信息 */
.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  position: relative;
  text-align: center;
  padding: 24px 20px;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow);
  transition: all 0.3s ease;
}

.stat-item:hover {
  box-shadow: var(--neu-shadow-hover);
}

.stat-item h3 {
  margin: 0 0 8px 0;
  font-size: 2em;
  color: var(--primary-color);
  font-weight: 600;
}

.stat-item p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-item i {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--primary-color);
  opacity: 0.3;
  font-size: 20px;
}

/* 用户内容 */
.user-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 20px;
}

.quick-actions h3 {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow);
}

.action-item:hover {
  box-shadow: var(--neu-shadow-hover);
  transform: translateY(-2px);
}

.action-item i {
  font-size: 2em;
  margin-bottom: 12px;
  color: var(--primary-color);
}

.action-item span {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 章节头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  margin: 0;
  color: var(--text-primary);
}

.view-all-btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 16px;
}

.content-section h3 {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 2em;
  margin-bottom: 12px;
  color: var(--text-muted);
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.empty-state .neu-button {
  padding: 8px 16px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: var(--neu-bg);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  box-shadow: var(--neu-shadow-hover);
  transform: translateY(-3px);
}

.playlist-cover {
  position: relative;
  overflow: hidden;
}

.playlist-cover img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .playlist-cover img {
  transform: scale(1.05);
}

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
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
  font-size: 2em;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.playlist-info {
  padding: 16px;
}

.playlist-info h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.creation-time,
.subscriber-count {
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .me-page {
    padding: 20px 16px;
  }
  
  .login-prompt {
    padding: 30px 20px;
  }
  
  .login-actions {
    flex-direction: column;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .profile-actions {
    flex-direction: row;
  }
  
  .user-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .playlist-cover img {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .user-stats {
    grid-template-columns: 1fr;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .playlist-cover img {
    height: 140px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>