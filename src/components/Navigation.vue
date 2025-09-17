<template>
  <nav class="navigation">
    <!-- 导航按钮 -->
    <div class="nav-buttons">
      <button class="nav-button" @click="goBack" :disabled="!canGoBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button class="nav-button" @click="goForward" :disabled="!canGoForward">
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- 导航链接 -->
    <div class="nav-links">
      <router-link 
        to="/" 
        class="nav-link" 
        :class="{ active: $route.name === 'Home' }"
      >
        首页
      </router-link>
      <router-link 
        to="/discover" 
        class="nav-link" 
        :class="{ active: $route.name === 'Discover' }"
      >
        发现
      </router-link>
      <a 
        class="nav-link" 
        @click="showCurrentPlaying"
        v-if="currentSong"
      >
        正在播放
      </a>
    </div>

    <!-- 工具栏 -->
    <div class="nav-toolbar">
      <!-- 搜索框 -->
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
          @input="onSearchInput"
          class="search-input" 
          placeholder="搜索音乐、歌手、专辑"
        />
      </div>

      <!-- 用户头像和信息 -->
      <div class="user-container">
        <div class="user-info" v-if="userStore.isLoggedIn">
          <span class="user-nickname">{{ userStore.nickname || '用户' }}</span>
          <div class="user-status">
            <span class="status-indicator online"></span>
            <span class="status-text">在线</span>
          </div>
        </div>
        
        <div class="user-avatar" @click="toggleUserMenu">
          <img 
            v-if="userStore.avatarUrl" 
            :src="userStore.avatarUrl" 
            :alt="userStore.nickname"
            class="avatar-image"
          />
          <i v-else class="fas fa-user-alt avatar-icon"></i>
        </div>

        <!-- 用户下拉菜单 -->
        <div v-if="showUserMenu" class="user-menu" @click.stop>
          <div class="menu-header">
            <div class="menu-avatar">
              <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" :alt="userStore.nickname" />
              <i v-else class="fas fa-user"></i>
            </div>
            <div class="menu-info">
              <div class="menu-name">{{ userStore.nickname || '未登录' }}</div>
              <div class="menu-status">
                <span class="status-indicator" :class="{ online: userStore.isLoggedIn }"></span>
                <span>{{ userStore.isLoggedIn ? '在线' : '未登录' }}</span>
              </div>
            </div>
          </div>
          <div class="menu-items">
            <button class="menu-item" @click="openSettings">
              <i class="fas fa-cog"></i>
              设置
            </button>
            <button v-if="!userStore.isLoggedIn" class="menu-item" @click="goLogin">
              <i class="fas fa-sign-in-alt"></i>
              登录 / 注册
            </button>
            <button v-else class="menu-item" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              退出登录
            </button>
          </div>
        </div>

        <!-- 登出按钮 -->
        <button 
          v-if="userStore.isLoggedIn" 
          class="logout-button" 
          @click="handleLogout"
          title="退出登录"
        >
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, usePlayerStore, useAppStore } from '@/stores'
import { utils } from '@/services'

// Router 实例
const router = useRouter()
const route = useRoute()

// Store 实例
const userStore = useUserStore()
const playerStore = usePlayerStore()
const appStore = useAppStore()

// 响应式数据
const searchKeyword = ref('')
const showUserMenu = ref(false)

// 计算属性
const currentSong = computed(() => playerStore.currentSong)
const canGoBack = computed(() => window.history.length > 1)
const canGoForward = computed(() => false) // 浏览器 API 限制

// 防抖搜索
const debouncedSearch = utils.debounce((keyword) => {
  if (keyword.trim()) {
    appStore.setSearchKeyword(keyword)
    router.push({ name: 'Search', query: { q: keyword } })
  }
}, 500)

// 方法
const goBack = () => {
  if (canGoBack.value) {
    router.go(-1)
  }
}

const goForward = () => {
  if (canGoForward.value) {
    router.go(1)
  }
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    appStore.setSearchKeyword(keyword)
    router.push({ name: 'Search', query: { q: keyword } })
  }
}

const onSearchInput = () => {
  debouncedSearch(searchKeyword.value)
}

const showCurrentPlaying = () => {
  // 跳转到正在播放页面
  router.push({ name: 'NowPlaying' })
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goLogin = () => {
  showUserMenu.value = false
  router.push({ name: 'Login' })
}

const openSettings = () => {
  showUserMenu.value = false
  appStore.showModal('settingsModal')
}

const handleLogout = async () => {
  try {
    appStore.setLoading(true)
    await userStore.logout()
    appStore.showSuccess('已退出登录')
    router.push({ name: 'Home' })
  } catch (error) {
    appStore.showError('退出登录失败')
  } finally {
    appStore.setLoading(false)
  }
}

// 监听路由变化来同步搜索关键词
watch(() => route.query.q, (newKeyword) => {
  searchKeyword.value = newKeyword || ''
}, { immediate: true })

// 监听全局搜索关键词变化
watch(() => appStore.searchKeyword, (newKeyword) => {
  searchKeyword.value = newKeyword
})

// 点击外部关闭菜单
const handleDocumentClick = (e) => {
  const menu = document.querySelector('.user-menu')
  const avatar = document.querySelector('.user-avatar')
  if (showUserMenu.value && menu && !menu.contains(e.target) && avatar && !avatar.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
@import '@/assets/css/navigation.css';

.user-container { position: relative; }
.user-menu {
  position: absolute;
  top: 48px;
  right: 0;
  width: 220px;
  background: var(--surface-color);
  box-shadow: var(--neu-shadow);
  border-radius: 12px;
  padding: 10px;
  z-index: 1000;
}
.menu-header { display: flex; gap: 10px; padding: 8px 8px 12px 8px; border-bottom: 1px solid var(--border-color); }
.menu-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--neu-bg); box-shadow: var(--neu-shadow-inset); }
.menu-avatar img { width: 100%; height: 100%; object-fit: cover; }
.menu-info { flex: 1; min-width: 0; }
.menu-name { font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.menu-status { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 12px; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); }
.status-indicator.online { background: #2ecc71; }
.menu-items { display: flex; flex-direction: column; padding-top: 8px; }
.menu-item { text-align: left; background: transparent; border: none; padding: 10px 8px; border-radius: 8px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; }
.menu-item:hover { background: var(--primary-light); color: var(--primary-color); }
</style>