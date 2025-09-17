<template>
  <div class="app">
    <!-- 导航栏 -->
    <Navigation v-if="!isLoginPage" class="app-nav" />
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 播放器 -->
    <Player v-if="!isLoginPage && currentSong" class="app-player" />
    
    <!-- 消息提示 -->
    <MessageContainer />
    
    <!-- 模态框 -->
    <ArtistModal />
    <PlaylistModal />
    <SettingsModal />
    
    <!-- 全局加载指示器 -->
    <div v-if="loading" class="global-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore, usePlayerStore, useAppStore } from '@/stores'

// 组件导入
import Navigation from '@/components/Navigation.vue'
import Player from '@/components/Player.vue'
import MessageContainer from '@/components/MessageContainer.vue'
import ArtistModal from '@/components/ArtistModal.vue'
import PlaylistModal from '@/components/PlaylistModal.vue'
import SettingsModal from '@/components/SettingsModal.vue'

// Store 实例
const route = useRoute()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const appStore = useAppStore()

// 计算属性
const isLoginPage = computed(() => route.name === 'Login')
const currentSong = computed(() => playerStore.currentSong)
const loading = computed(() => appStore.loading)

// 监听路由变化
watch(route, (to) => {
  appStore.setCurrentPage(to.name)
}, { immediate: true })

// 监听主题变化
watch(() => appStore.theme, (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}, { immediate: true })

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // 页面隐藏时暂停音乐（可选）
    // playerStore.pause()
  } else {
    // 页面显示时验证登录状态
    if (userStore.isLoggedIn) {
      userStore.verifyLoginStatus()
    }
  }
}

// 键盘快捷键
const handleKeyboard = (event) => {
  // 防止在输入框中触发快捷键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }
  
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      playerStore.togglePlay()
      break
    case 'ArrowLeft':
      if (event.ctrlKey) {
        event.preventDefault()
        playerStore.previous()
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey) {
        event.preventDefault()
        playerStore.next()
      }
      break
    case 'ArrowUp':
      if (event.ctrlKey) {
        event.preventDefault()
        const newVolume = Math.min(1, playerStore.volume + 0.1)
        playerStore.setVolume(newVolume)
      }
      break
    case 'ArrowDown':
      if (event.ctrlKey) {
        event.preventDefault()
        const newVolume = Math.max(0, playerStore.volume - 0.1)
        playerStore.setVolume(newVolume)
      }
      break
  }
}

// 组件挂载时的初始化
onMounted(() => {
  // 初始化应用设置
  appStore.initializeApp()
  
  // 恢复用户登录状态
  userStore.restoreLoginState()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeyboard)
  
  // 防止默认的拖拽行为
  document.addEventListener('dragover', (e) => e.preventDefault())
  document.addEventListener('drop', (e) => e.preventDefault())
  
  // 设置初始主题
  document.documentElement.setAttribute('data-theme', appStore.theme)
})

// 组件卸载时清理
const cleanup = () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.removeEventListener('keydown', handleKeyboard)
}

// Vue 3 的 onBeforeUnmount
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(cleanup)
</script>

<style scoped>
/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 全局加载指示器 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.global-loading .loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid var(--shadow-dark);
  border-top: 6px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 应用布局 */
.app {
  min-height: 100vh;
  display: grid;
  grid-template-areas: 
    "nav"
    "main"
    "player";
  grid-template-rows: auto 1fr auto;
}

.app-nav {
  grid-area: nav;
}

.app-main {
  grid-area: main;
  overflow-y: auto;
  min-height: 0;
}

.app-player {
  grid-area: player;
}

/* 登录页面特殊布局 */
.app:has(.app-main .login-page) {
  grid-template-areas: "main";
  grid-template-rows: 1fr;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-main {
    padding-bottom: 0;
  }
}
</style>