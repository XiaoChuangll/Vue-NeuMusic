import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router.js'
import App from './App.vue'

// 导入全局样式
import './assets/css/main.css'

// 创建 Vue 应用
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 注册插件
app.use(pinia)
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 错误:', err)
  console.error('错误信息:', info)
}

// 挂载应用
app.mount('#app')

// 初始化应用状态
const initializeApp = async () => {
  const { useUserStore, usePlayerStore, useAppStore } = await import('./stores')
  
  try {
    // 初始化应用设置
    const appStore = useAppStore()
    appStore.initializeApp()
    
    // 恢复用户登录状态（异步）
    const userStore = useUserStore()
    await userStore.restoreLoginState()
    
    // 初始化播放器
    const playerStore = usePlayerStore()
    playerStore.initAudio()
    playerStore.restoreFromLocalStorage()
    
    console.log('应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 应用加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeApp)