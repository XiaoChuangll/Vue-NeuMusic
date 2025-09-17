<template>
  <div class="qr-login-page">
    <div class="qr-login-container">
      <div class="qr-login-header">
        <h1>扫码登录</h1>
        <p>请在此页面完成登录以继续使用</p>
      </div>

      <!-- 登录状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在处理登录请求...</p>
      </div>

      <!-- 登录表单 -->
      <div v-else-if="!loginSuccess" class="login-form">
        <div class="login-method-tabs">
          <button 
            class="method-tab" 
            :class="{ active: loginMethod === 'phone' }"
            @click="loginMethod = 'phone'"
          >
            <i class="fas fa-mobile-alt"></i>
            手机号
          </button>
          <button 
            class="method-tab" 
            :class="{ active: loginMethod === 'email' }"
            @click="loginMethod = 'email'"
          >
            <i class="fas fa-envelope"></i>
            邮箱
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="login-form-content">
          <div class="input-group">
            <i :class="loginMethod === 'phone' ? 'fas fa-mobile-alt' : 'fas fa-envelope'"></i>
            <input 
              v-model="account"
              :placeholder="loginMethod === 'phone' ? '请输入手机号' : '请输入邮箱'"
              type="text"
              :disabled="isLogging"
              required
            />
          </div>
          
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input 
              v-model="password"
              placeholder="请输入密码"
              :type="showPassword ? 'text' : 'password'"
              :disabled="isLogging"
              required
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="isLogging"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          
          <button 
            type="submit"
            class="login-button"
            :disabled="isLogging || !canLogin"
          >
            <i v-if="isLogging" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            {{ isLogging ? '登录中...' : '确认登录' }}
          </button>
        </form>
      </div>

      <!-- 登录成功 -->
      <div v-else class="success-state">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>登录成功！</h2>
        <p>正在跳转到音乐应用...</p>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </div>

      <!-- 返回链接 -->
      <div class="back-link">
        <router-link to="/login">
          <i class="fas fa-arrow-left"></i>
          返回登录页面
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import CryptoJS from 'crypto-js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loginMethod = ref('phone')
const account = ref('')
const password = ref('')
const showPassword = ref(false)
const isLogging = ref(false)
const errorMessage = ref('')
const loginSuccess = ref(false)
const loading = ref(false)

// 计算属性
const canLogin = computed(() => {
  return account.value.trim() && password.value.trim()
})

// 方法
const handleLogin = async () => {
  if (!canLogin.value) return
  
  isLogging.value = true
  errorMessage.value = ''
  
  try {
    const isPhone = loginMethod.value === 'phone'
    const encryptedPassword = CryptoJS.MD5(password.value).toString()
    
    let result
    if (isPhone) {
      result = await userStore.loginByPhone(account.value, encryptedPassword)
    } else {
      result = await userStore.loginByEmail(account.value, encryptedPassword)
    }
    
    if (result.success) {
      loginSuccess.value = true
      
      // 通知站内二维码登录成功（如果有key参数）
      const key = route.query.key
      if (key) {
        await userStore.handleInternalQrLogin(key, {
          account: account.value,
          loginMethod: loginMethod.value
        })
      }
      
      // 跳转到主页
      setTimeout(() => {
        // 尝试打开主应用窗口
        const mainWindow = window.opener
        if (mainWindow) {
          mainWindow.postMessage({
            type: 'QR_LOGIN_SUCCESS',
            data: result
          }, window.location.origin)
          window.close()
        } else {
          router.push('/')
        }
      }, 2000)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = '登录失败，请重试'
  } finally {
    isLogging.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    loginSuccess.value = true
    setTimeout(() => {
      const mainWindow = window.opener
      if (mainWindow) {
        mainWindow.postMessage({
          type: 'QR_LOGIN_SUCCESS',
          data: { success: true, message: '已登录' }
        }, window.location.origin)
        window.close()
      } else {
        router.push('/')
      }
    }, 1000)
  }
})
</script>

<style scoped>
.qr-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neu-bg);
  padding: 20px;
}

.qr-login-container {
  width: 100%;
  max-width: 400px;
  background: var(--neu-bg);
  border-radius: 20px;
  box-shadow: var(--neu-shadow);
  padding: 32px;
  text-align: center;
}

.qr-login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 8px 0;
}

.qr-login-header p {
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  padding: 40px 0;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--text-disabled);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-state p {
  color: var(--text-secondary);
  margin: 0;
}

/* 登录表单 */
.login-method-tabs {
  display: flex;
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 4px;
  gap: 4px;
  margin-bottom: 24px;
}

.method-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.method-tab:hover {
  color: var(--text-primary);
}

.method-tab.active {
  background: var(--neu-bg);
  color: var(--primary-color);
  box-shadow: var(--neu-shadow-small);
}

.login-form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 0 16px;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  box-shadow: var(--neu-shadow-inset), 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.input-group i {
  color: var(--text-secondary);
  margin-right: 12px;
  width: 16px;
  text-align: center;
}

.input-group input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 0;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.input-group input::placeholder {
  color: var(--text-secondary);
}

.password-toggle {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.login-button {
  margin-top: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 成功状态 */
.success-state {
  padding: 40px 0;
}

.success-icon {
  margin-bottom: 16px;
}

.success-icon i {
  font-size: 48px;
  color: #27ae60;
}

.success-state h2 {
  font-size: 20px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.success-state p {
  color: var(--text-secondary);
  margin: 0;
}

/* 错误信息 */
.error-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 返回链接 */
.back-link {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.back-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.back-link a:hover {
  text-decoration: underline;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .qr-login-container {
    padding: 24px 20px;
    margin: 0 16px;
  }
  
  .qr-login-header h1 {
    font-size: 24px;
  }
}
</style>