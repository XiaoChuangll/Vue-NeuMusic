<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>NeuMusic</h1>
        <p>登录享受完整音乐体验</p>
      </div>

      <!-- 游客模式提示 -->
      <div class="guest-tip">
        <div class="tip-content">
          <i class="fas fa-info-circle"></i>
          <span>已支持游客模式浏览，</span>
          <router-link to="/" class="guest-link">直接体验</router-link>
        </div>
      </div>

      <!-- 登录方式选择 -->
      <div class="login-methods">
        <div class="method-tabs">
          <button 
            class="method-tab" 
            :class="{ active: loginMethod === 'official' }"
            @click="switchLoginMethod('official')"
          >
            <i class="fas fa-shield-alt"></i>
            官方登录
          </button>
          <button 
            class="method-tab" 
            :class="{ active: loginMethod === 'account' }"
            @click="switchLoginMethod('account')"
          >
            <i class="fas fa-user"></i>
            账号登录
          </button>
          <button 
            class="method-tab" 
            :class="{ active: loginMethod === 'qr' }"
            @click="switchLoginMethod('qr')"
          >
            <i class="fas fa-qrcode"></i>
            二维码登录
          </button>
        </div>
      </div>

      <!-- 官方登录界面 -->
      <div v-if="loginMethod === 'official'" class="official-login">
        <div class="official-container">
          <div class="official-header">
            <h3>网易云音乐登录</h3>
            <p>安全便捷的站内登录体验</p>
          </div>
          
          <!-- 站内登录区域 -->
          <div class="embedded-login">
            <div class="embedded-tabs">
              <button 
                class="embedded-tab" 
                :class="{ active: embeddedMethod === 'phone' }"
                @click="switchEmbeddedMethod('phone')"
              >
                <i class="fas fa-mobile-alt"></i>
                手机号
              </button>
              <button 
                class="embedded-tab" 
                :class="{ active: embeddedMethod === 'email' }"
                @click="switchEmbeddedMethod('email')"
              >
                <i class="fas fa-envelope"></i>
                邮箱
              </button>
              <button 
                class="embedded-tab" 
                :class="{ active: embeddedMethod === 'qr' }"
                @click="switchEmbeddedMethod('qr')"
              >
                <i class="fas fa-qrcode"></i>
                扫码
              </button>
              <button 
                class="embedded-tab" 
                :class="{ active: embeddedMethod === 'web' }"
                @click="switchEmbeddedMethod('web')"
              >
                <i class="fas fa-globe"></i>
                Web同步
              </button>
            </div>
            
            <!-- 账号密码登录 -->
            <div v-if="embeddedMethod === 'phone' || embeddedMethod === 'email'" class="embedded-form">
              <div class="embedded-input neu-inset">
                <i :class="embeddedMethod === 'phone' ? 'fas fa-mobile-alt' : 'fas fa-envelope'"></i>
                <input 
                  v-model="embeddedAccount"
                  :placeholder="embeddedMethod === 'phone' ? '请输入手机号' : '请输入邮箱'"
                  type="text"
                  :disabled="embeddedLogging"
                  @focus="clearEmbeddedMessages"
                />
              </div>
              
              <div class="embedded-input neu-inset">
                <i class="fas fa-lock"></i>
                <input 
                  v-model="embeddedPassword"
                  placeholder="请输入密码"
                  :type="showEmbeddedPassword ? 'text' : 'password'"
                  :disabled="embeddedLogging"
                  @keyup.enter="handleEmbeddedLogin"
                  @focus="clearEmbeddedMessages"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showEmbeddedPassword = !showEmbeddedPassword"
                  :disabled="embeddedLogging"
                >
                  <i :class="showEmbeddedPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              
              <button 
                class="embedded-login-btn neu-button primary"
                @click="handleEmbeddedLogin"
                :disabled="embeddedLogging || !canEmbeddedLogin"
              >
                <i v-if="embeddedLogging" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-sign-in-alt"></i>
                {{ embeddedLogging ? '登录中...' : '登录' }}
              </button>
            </div>
            
            <!-- 内嵌二维码登录 -->
            <div v-else-if="embeddedMethod === 'qr'" class="embedded-qr">
              <!-- 二维码模式选择 -->
              <div class="qr-mode-selector">
                <button 
                  class="mode-option" 
                  :class="{ active: qrMode === 'official' }"
                  @click="switchQrMode('official')"
                >
                  <i class="fas fa-external-link-alt"></i>
                  官方扫码
                </button>
                <button 
                  class="mode-option" 
                  :class="{ active: qrMode === 'internal' }"
                  @click="switchQrMode('internal')"
                >
                  <i class="fas fa-home"></i>
                  站内扫码
                </button>
              </div>
              
              <div class="embedded-qr-container">
                <img 
                  v-if="userStore.qrCode.qrimg && embeddedQrStatus !== 'expired'"
                  :src="userStore.qrCode.qrimg"
                  alt="登录二维码"
                  class="embedded-qr-image"
                />
                <div v-else-if="embeddedQrStatus === 'expired'" class="embedded-qr-expired">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>二维码已过期</p>
                </div>
                <div v-else class="embedded-qr-loading">
                  <div class="loading-spinner"></div>
                  <p>正在生成二维码...</p>
                </div>
              </div>
              
              <div class="embedded-qr-status">
                <p v-if="embeddedQrStatus === 'waiting'" class="status-waiting">
                  <i class="fas fa-mobile-alt"></i>
                  {{ qrMode === 'official' ? '请使用网易云音乐APP扫码登录' : '请使用扫码工具扫码在站内登录' }}
                </p>
                <p v-else-if="embeddedQrStatus === 'scanned'" class="status-scanned">
                  <i class="fas fa-check-circle"></i>
                  {{ qrMode === 'official' ? '扫码成功，请在手机上确认登录' : '扫码成功，请在页面中完成登录' }}
                </p>
                <p v-else-if="embeddedQrStatus === 'expired'" class="status-expired">
                  <i class="fas fa-exclamation-triangle"></i>
                  二维码已过期，请刷新
                </p>
              </div>
              
              <!-- 站内二维码说明 -->
              <div v-if="qrMode === 'internal'" class="internal-qr-info">
                <div class="info-item">
                  <i class="fas fa-info-circle"></i>
                  <span>扫码后将在站内打开登录页面</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-shield-alt"></i>
                  <span>全程在站内完成，保证安全性</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-mobile-alt"></i>
                  <span>支持任何扫码工具或APP</span>
                </div>
              </div>
              
              <div class="embedded-qr-actions">
                <button 
                  v-if="embeddedQrStatus === 'expired'"
                  class="neu-button primary"
                  @click="refreshEmbeddedQR"
                >
                  <i class="fas fa-redo-alt"></i>
                  刷新二维码
                </button>
              </div>
            </div>
            
            <!-- Web同步登录 -->
            <div v-else-if="embeddedMethod === 'web'" class="embedded-web">
              <div class="web-sync-container">
                <div class="web-sync-header">
                  <i class="fas fa-globe"></i>
                  <h4>网易云音乐Web版同步登录</h4>
                  <p>自动检测并同步您在网易云音乐官网的登录状态</p>
                </div>
                
                <!-- 操作按钮 -->
                <div class="web-sync-actions">
                  <button 
                    class="neu-button"
                    @click="checkOfficialLoginStatus"
                    :disabled="checking"
                  >
                    <i v-if="checking" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-sync-alt"></i>
                    {{ checking ? '检查中...' : '检查登录状态' }}
                  </button>
                  
                  <button 
                    class="neu-button primary"
                    @click="startWebLoginSync"
                    :disabled="webSyncing"
                  >
                    <i v-if="webSyncing" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-magic"></i>
                    {{ webSyncing ? '同步中...' : '自动同步登录' }}
                  </button>
                </div>
                
                <!-- 状态信息 -->
                <div v-if="statusMessage" class="status-message" :class="statusType">
                  <i :class="statusType === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'"></i>
                  {{ statusMessage }}
                </div>
                
                <!-- Web版登录同步进度 -->
                <div v-if="webSyncProgress" class="web-sync-progress">
                  <div class="progress-info">
                    <i class="fas fa-search"></i>
                    <span>{{ webSyncProgress.message }}</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: (webSyncProgress.attempts / webSyncProgress.maxAttempts * 100) + '%' }"
                    ></div>
                  </div>
                  <div class="progress-text">
                    {{ webSyncProgress.attempts }} / {{ webSyncProgress.maxAttempts }}
                  </div>
                </div>
                
                <!-- 使用说明 -->
                <div class="web-sync-instructions">
                  <div class="instruction-item">
                    <i class="fas fa-info-circle"></i>
                    <span>请先在网易云音乐官网登录，然后点击"自动同步登录"</span>
                  </div>
                  <div class="instruction-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>系统将自动检测您的登录状态并同步到本站</span>
                  </div>
                  <div class="instruction-item">
                    <i class="fas fa-external-link-alt"></i>
                    <span>支持手机号、邮箱和二维码等多种登录方式</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 传统账号登录 -->
      <div v-else-if="loginMethod === 'account'" class="account-login">
        <!-- 账号输入框 -->
        <div class="login-box neu-inset">
          <i class="fas fa-envelope" v-if="accountType === 'email'"></i>
          <i class="fas fa-mobile-alt" v-else></i>
          <input 
            v-model="account"
            :placeholder="accountType === 'email' ? '请输入邮箱' : '请输入手机号'"
            type="text"
            :disabled="isLogging"
            @focus="errorMessage = ''"
          />
        </div>

        <!-- 密码输入框 -->
        <div class="login-box neu-inset">
          <i class="fas fa-lock"></i>
          <input 
            v-model="password"
            placeholder="请输入密码"
            :type="showPassword ? 'text' : 'password'"
            :disabled="isLogging"
            @keyup.enter="handleAccountLogin"
            @focus="errorMessage = ''"
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

        <!-- 登录按钮 -->
        <div class="login-buttons">
          <button 
            class="login-btn neu-button primary"
            @click="handleAccountLogin"
            :disabled="isLogging || !canLogin"
          >
            <i v-if="isLogging" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            {{ isLogging ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <!-- 切换账号类型 -->
        <div class="account-switch">
          <a 
            v-if="accountType === 'phone'"
            @click="accountType = 'email'"
          >
            使用邮箱登录
          </a>
          <a 
            v-else
            @click="accountType = 'phone'"
          >
            使用手机号登录
          </a>
        </div>
      </div>

      <!-- 二维码登录 -->
      <div v-else-if="loginMethod === 'qr'" class="qr-login">
        <div class="qr-container">
          <img 
            v-if="userStore.qrCode.qrimg && qrStatus !== 'expired'"
            :src="userStore.qrCode.qrimg"
            alt="登录二维码"
            class="qr-image"
          />
          <div v-else-if="qrStatus === 'expired'" class="qr-expired">
            <i class="fas fa-exclamation-triangle"></i>
            <p>二维码已过期</p>
          </div>
          <div v-else class="qr-loading">
            <div class="loading-spinner"></div>
            <p>正在生成二维码...</p>
          </div>
        </div>

        <div class="qr-status">
          <p v-if="qrStatus === 'waiting'" class="status-waiting">
            <i class="fas fa-mobile-alt"></i>
            请使用网易云音乐APP扫码登录
          </p>
          <p v-else-if="qrStatus === 'scanned'" class="status-scanned">
            <i class="fas fa-check-circle"></i>
            扫码成功，请在手机上确认登录
          </p>
          <p v-else-if="qrStatus === 'expired'" class="status-expired">
            <i class="fas fa-exclamation-triangle"></i>
            二维码已过期，请刷新
          </p>
        </div>

        <div class="qr-actions">
          <button 
            v-if="qrStatus === 'expired'"
            class="neu-button primary"
            @click="refreshQR"
          >
            <i class="fas fa-redo-alt"></i>
            刷新二维码
          </button>
          
          <button 
            class="neu-button"
            @click="switchToAccount"
          >
            <i class="fas fa-user"></i>
            使用账号登录
          </button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </div>

      <!-- 成功信息 -->
      <div v-if="successMessage" class="success-message">
        <i class="fas fa-check-circle"></i>
        {{ successMessage }}
      </div>

      <!-- 登录说明 -->
      <div class="login-notice">
        <p>登录即表示同意本站的用户协议和隐私政策</p>
        <p>官方登录方式更安全，推荐使用</p>
        <div class="official-verify-tip">
          <i class="fas fa-shield-alt"></i>
          <span>使用网易云音乐官方接口验证登录状态，确保安全性</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useAppStore } from '@/stores'
import { utils } from '@/services'
import CryptoJS from 'crypto-js'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const loginMethod = ref('official')
const accountType = ref('phone')
const account = ref('')
const password = ref('')
const showPassword = ref(false)
const isLogging = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const qrStatus = ref('waiting')
const checking = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

// Web版登录同步相关
const webSyncing = ref(false)
const webSyncProgress = ref(null)

// 官方登录相关
const officialLoginType = ref('embedded')
const embeddedMethod = ref('phone')
const embeddedAccount = ref('')
const embeddedPassword = ref('')
const showEmbeddedPassword = ref(false)
const embeddedLogging = ref(false)
const embeddedQrStatus = ref('waiting')

// 二维码模式相关
const qrMode = ref('official') // 'official' 或 'internal'
const internalQrData = ref(null)

// 定时器
let qrCheckTimer = null
let embeddedQrCheckTimer = null

// 计算属性
const canLogin = computed(() => {
  return account.value.trim() && password.value.trim()
})

const canEmbeddedLogin = computed(() => {
  return embeddedAccount.value.trim() && embeddedPassword.value.trim()
})

// 方法实现
const switchLoginMethod = (method) => {
  loginMethod.value = method
  clearMessages()
  if (method === 'qr') {
    initQrLogin()
  }
}

const switchOfficialLoginType = (type) => {
  officialLoginType.value = type
  clearMessages()
  if (type === 'embedded' && embeddedMethod.value === 'qr') {
    initEmbeddedQrLogin()
  }
}

const switchEmbeddedMethod = (method) => {
  embeddedMethod.value = method
  clearEmbeddedMessages()
  if (method === 'qr') {
    initEmbeddedQrLogin()
  }
}

// 切换二维码模式
const switchQrMode = (mode) => {
  qrMode.value = mode
  clearEmbeddedMessages()
  
  if (embeddedMethod.value === 'qr') {
    if (mode === 'official') {
      initEmbeddedQrLogin()
    } else {
      initInternalQrLogin()
    }
  }
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  statusMessage.value = ''
}

const clearEmbeddedMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// 站内登录处理
const handleEmbeddedLogin = async () => {
  if (!canEmbeddedLogin.value) return
  
  embeddedLogging.value = true
  clearEmbeddedMessages()
  
  try {
    const isPhone = embeddedMethod.value === 'phone'
    const encryptedPassword = CryptoJS.MD5(embeddedPassword.value).toString()
    
    let result
    if (isPhone) {
      result = await userStore.loginByPhone(embeddedAccount.value, encryptedPassword)
    } else {
      result = await userStore.loginByEmail(embeddedAccount.value, encryptedPassword)
    }
    
    if (result.success) {
      successMessage.value = result.message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    console.error('站内登录失败:', error)
    errorMessage.value = '登录失败，请重试'
  } finally {
    embeddedLogging.value = false
  }
}

// 传统账号登录
const handleAccountLogin = async () => {
  if (!canLogin.value) return
  
  isLogging.value = true
  errorMessage.value = ''
  
  try {
    const isPhone = accountType.value === 'phone'
    const encryptedPassword = CryptoJS.MD5(password.value).toString()
    
    let result
    if (isPhone) {
      result = await userStore.loginByPhone(account.value, encryptedPassword)
    } else {
      result = await userStore.loginByEmail(account.value, encryptedPassword)
    }
    
    if (result.success) {
      successMessage.value = result.message
      setTimeout(() => {
        router.push('/')
      }, 1500)
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

// 二维码相关
const initQrLogin = async () => {
  const result = await userStore.getQrCode()
  if (result.success) {
    qrStatus.value = 'waiting'
    startQrStatusCheck()
  }
}

const initEmbeddedQrLogin = async () => {
  if (qrMode.value === 'official') {
    const result = await userStore.getQrCode()
    if (result.success) {
      embeddedQrStatus.value = 'waiting'
      startEmbeddedQrStatusCheck()
    }
  } else {
    initInternalQrLogin()
  }
}

// 初始化站内二维码登录
const initInternalQrLogin = async () => {
  const result = await userStore.getInternalQrCode()
  if (result.success) {
    embeddedQrStatus.value = 'waiting'
    internalQrData.value = userStore.qrCode
    // 站内二维码不需要轮询，等待用户扫码后手动处理
  } else {
    errorMessage.value = result.message || '生成站内二维码失败'
  }
}

const startQrStatusCheck = () => {
  if (qrCheckTimer) clearInterval(qrCheckTimer)
  
  qrCheckTimer = setInterval(async () => {
    const result = await userStore.checkQrStatus()
    
    if (result.status === 'success') {
      qrStatus.value = 'success'
      clearInterval(qrCheckTimer)
      successMessage.value = result.message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else if (result.status === 'scanned') {
      qrStatus.value = 'scanned'
    } else if (result.status === 'expired') {
      qrStatus.value = 'expired'
      clearInterval(qrCheckTimer)
    }
  }, 2000)
}

const startEmbeddedQrStatusCheck = () => {
  if (embeddedQrCheckTimer) clearInterval(embeddedQrCheckTimer)
  
  embeddedQrCheckTimer = setInterval(async () => {
    const result = await userStore.checkQrStatus()
    
    if (result.status === 'success') {
      embeddedQrStatus.value = 'success'
      clearInterval(embeddedQrCheckTimer)
      successMessage.value = result.message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else if (result.status === 'scanned') {
      embeddedQrStatus.value = 'scanned'
    } else if (result.status === 'expired') {
      embeddedQrStatus.value = 'expired'
      clearInterval(embeddedQrCheckTimer)
    }
  }, 2000)
}

const refreshQR = () => {
  initQrLogin()
}

const refreshEmbeddedQR = () => {
  if (qrMode.value === 'official') {
    initEmbeddedQrLogin()
  } else {
    initInternalQrLogin()
  }
}

const switchToAccount = () => {
  loginMethod.value = 'account'
}

// 官方登录状态检查
const checkOfficialLoginStatus = async () => {
  checking.value = true
  statusMessage.value = ''
  
  try {
    const result = await userStore.verifyOfficialLogin()
    
    if (result.isValid) {
      statusMessage.value = '检测到网易云音乐登录状态，正在同步...'
      statusType.value = 'success'
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      statusMessage.value = result.message || '未检测到登录状态，请先在网易云音乐网页版登录'
      statusType.value = 'info'
    }
  } catch (error) {
    console.error('检查官方登录状态失败:', error)
    statusMessage.value = '检查失败，请重试'
    statusType.value = 'error'
  } finally {
    checking.value = false
  }
}

// 开始web版登录同步
const startWebLoginSync = async () => {
  webSyncing.value = true
  webSyncProgress.value = null
  statusMessage.value = ''
  
  try {
    // 首先尝试直接同步
    statusMessage.value = '正在检查网易云音乐web版登录状态...'
    statusType.value = 'info'
    
    const quickResult = await userStore.syncLoginFromWeb()
    
    if (quickResult.success) {
      statusMessage.value = '成功获取登录状态，正在跳转...'
      statusType.value = 'success'
      
      setTimeout(() => {
        router.push('/')
      }, 1500)
      return
    }
    
    // 如果直接同步失败，开始轮询
    statusMessage.value = '未检测到登录状态，开始轮询检查...'
    
    const pollResult = await userStore.pollWebLoginStatus({
      maxAttempts: 30,
      interval: 2000,
      onProgress: (progress) => {
        webSyncProgress.value = progress
      },
      onSuccess: (result) => {
        statusMessage.value = '成功获取登录状态，正在跳转...'
        statusType.value = 'success'
        webSyncProgress.value = null
        
        setTimeout(() => {
          router.push('/')
        }, 1500)
      },
      onError: (error) => {
        statusMessage.value = error.message || '同步失败'
        statusType.value = 'error'
        webSyncProgress.value = null
      }
    })
    
    if (!pollResult.success && !webSyncProgress.value) {
      statusMessage.value = pollResult.message || '未检测到登录状态，请确保已在网易云音乐官网登录'
      statusType.value = 'info'
    }
    
  } catch (error) {
    console.error('Web版登录同步失败:', error)
    statusMessage.value = '同步过程中发生错误，请重试'
    statusType.value = 'error'
    webSyncProgress.value = null
  } finally {
    webSyncing.value = false
  }
}

// 停止web版登录同步
const stopWebLoginSync = () => {
  webSyncing.value = false
  webSyncProgress.value = null
  statusMessage.value = '已停止同步'
  statusType.value = 'info'
}

// 处理站内二维码登录
const handleInternalQrLogin = async (loginData) => {
  try {
    const result = await userStore.handleInternalQrLogin(userStore.qrCode.key, loginData)
    if (result.success) {
      embeddedQrStatus.value = 'success'
      successMessage.value = result.message
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      errorMessage.value = result.message
      embeddedQrStatus.value = 'waiting'
    }
  } catch (error) {
    console.error('处理站内二维码登录失败:', error)
    errorMessage.value = '登录处理失败，请重试'
    embeddedQrStatus.value = 'waiting'
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    router.push('/')
    return
  }
  
  // 默认初始化二维码
  if (loginMethod.value === 'qr') {
    initQrLogin()
  }
})

onUnmounted(() => {
  if (qrCheckTimer) {
    clearInterval(qrCheckTimer)
  }
  if (embeddedQrCheckTimer) {
    clearInterval(embeddedQrCheckTimer)
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neu-bg);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: var(--neu-bg);
  border-radius: 24px;
  box-shadow: var(--neu-shadow);
  padding: 40px 32px;
  text-align: center;
}

/* 登录头部 */
.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 8px 0;
}

.login-header p {
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  font-size: 16px;
}

/* 游客模式提示 */
.guest-tip {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.tip-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
}

.tip-content i {
  color: #3498db;
}

.guest-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.guest-link:hover {
  text-decoration: underline;
}

/* 登录方式选择 */
.login-methods {
  margin-bottom: 32px;
}

.method-tabs {
  display: flex;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow-inset);
  padding: 4px;
  gap: 4px;
}

.method-tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.method-tab i {
  font-size: 16px;
}

/* 官方登录区域 */
.official-login {
  text-align: left;
}

.official-container {
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow-inset);
  padding: 24px;
}

.official-header {
  text-align: center;
  margin-bottom: 24px;
}

.official-header h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.official-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

/* 登录选项切换 */
.login-options {
  margin-bottom: 24px;
}

.option-tabs {
  display: flex;
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 4px;
  gap: 4px;
}

.option-tab {
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
  font-size: 13px;
  font-weight: 500;
}

.option-tab:hover {
  color: var(--text-primary);
}

.option-tab.active {
  background: var(--neu-bg);
  color: var(--primary-color);
  box-shadow: var(--neu-shadow-small);
}

/* 站内登录区域 */
.embedded-login {
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 20px;
}

.embedded-tabs {
  display: flex;
  background: var(--neu-bg);
  border-radius: 10px;
  box-shadow: var(--neu-shadow-inset);
  padding: 3px;
  gap: 3px;
  margin-bottom: 20px;
}

.embedded-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.embedded-tab:hover {
  color: var(--text-primary);
}

.embedded-tab.active {
  background: var(--neu-bg);
  color: var(--primary-color);
  box-shadow: var(--neu-shadow-small);
}

/* 站内表单 */
.embedded-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.embedded-input {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 0 16px;
  transition: all 0.3s ease;
}

.embedded-input:focus-within {
  box-shadow: var(--neu-shadow-inset), 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.embedded-input i {
  color: var(--text-secondary);
  margin-right: 12px;
  width: 16px;
  text-align: center;
}

.embedded-input input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 0;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.embedded-input input::placeholder {
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

.embedded-login-btn {
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

.embedded-login-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.embedded-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 站内二维码 */
.embedded-qr {
  text-align: center;
}

/* 二维码模式选择器 */
.qr-mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--neu-bg);
  border-radius: 8px;
  box-shadow: var(--neu-shadow-inset);
  padding: 4px;
}

.mode-option {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.mode-option:hover {
  color: var(--text-primary);
}

.mode-option.active {
  background: var(--neu-bg);
  color: var(--primary-color);
  box-shadow: var(--neu-shadow-small);
}

.mode-option i {
  font-size: 14px;
}

.embedded-qr-container {
  margin-bottom: 16px;
  padding: 20px;
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
}

.embedded-qr-image {
  width: 180px;
  height: 180px;
  border-radius: 8px;
}

.embedded-qr-expired,
.embedded-qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: var(--text-secondary);
}

.embedded-qr-expired i,
.embedded-qr-loading .loading-spinner {
  font-size: 32px;
  margin-bottom: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--text-disabled);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.embedded-qr-status {
  margin-bottom: 16px;
}

.embedded-qr-status p {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 站内二维码说明 */
.internal-qr-info {
  margin: 16px 0;
  padding: 12px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 1.4;
  text-align: left;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
  width: 14px;
}

.info-item span {
  color: var(--text-primary);
  flex: 1;
}

.status-waiting {
  color: var(--text-secondary);
}

.status-scanned {
  color: #27ae60;
}

.status-expired {
  color: #e74c3c;
}

/* 传统账号登录 */
.account-login {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow-inset);
  padding: 0 20px;
  transition: all 0.3s ease;
}

.login-box:focus-within {
  box-shadow: var(--neu-shadow-inset), 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.login-box i {
  color: var(--text-secondary);
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.login-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 16px 0;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
}

.login-box input::placeholder {
  color: var(--text-secondary);
}

.login-buttons {
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: var(--primary-color);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.account-switch {
  text-align: center;
}

.account-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
}

.account-switch a:hover {
  text-decoration: underline;
}

/* 二维码登录 */
.qr-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.qr-container {
  padding: 32px;
  background: var(--neu-bg);
  border-radius: 20px;
  box-shadow: var(--neu-shadow-inset);
}

.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 12px;
}

.qr-expired,
.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  color: var(--text-secondary);
}

.qr-expired i,
.qr-loading .loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
}

.qr-status {
  text-align: center;
}

.qr-status p {
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.qr-actions {
  display: flex;
  gap: 16px;
}

/* Web同步登录 */
.embedded-web {
  text-align: center;
}

.web-sync-container {
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  padding: 20px;
}

.web-sync-header {
  margin-bottom: 20px;
  text-align: center;
}

.web-sync-header i {
  font-size: 32px;
  color: var(--primary-color);
  margin-bottom: 12px;
  display: block;
}

.web-sync-header h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.web-sync-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.web-sync-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.web-sync-actions .neu-button {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: var(--neu-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--neu-shadow-small);
}

.web-sync-actions .neu-button:hover:not(:disabled) {
  box-shadow: var(--neu-shadow-hover);
  transform: translateY(-1px);
}

.web-sync-actions .neu-button.primary {
  background: var(--primary-color);
  color: white;
}

.web-sync-actions .neu-button.primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.web-sync-actions .neu-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.web-sync-instructions {
  margin-top: 20px;
  padding: 16px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.instruction-item i {
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
  width: 16px;
}

.instruction-item span {
  color: var(--text-primary);
  flex: 1;
}

/* 消息提示 */
.error-message,
.success-message {
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.success-message {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

/* 登录说明 */
.login-notice {
  margin-top: 32px;
  text-align: center;
}

.login-notice p {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.official-verify-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.official-verify-tip i {
  color: #27ae60;
}

.official-verify-tip span {
  color: var(--text-primary);
  font-size: 12px;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 32px 24px;
    margin: 0 16px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
  
  .method-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .method-tab {
    padding: 16px;
    border-radius: 12px;
  }
  
  .option-tabs,
  .embedded-tabs {
    flex-direction: column;
    gap: 6px;
  }
  
  .qr-image,
  .embedded-qr-image {
    width: 160px;
    height: 160px;
  }
  
  .qr-container {
    padding: 24px;
  }
  
  .qr-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .login-container {
    padding: 24px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .login-header p {
    font-size: 14px;
  }
  
  .qr-image,
  .embedded-qr-image {
    width: 140px;
    height: 140px;
  }
}
</style>