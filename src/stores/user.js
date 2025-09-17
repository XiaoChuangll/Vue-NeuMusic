import { defineStore } from 'pinia'
import { userApi } from '@/services'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 登录状态
    isLoggedIn: false,
    // 用户信息
    userInfo: null,
    // 用户详情
    userDetail: null,
    // 用户歌单
    userPlaylists: [],
    // 创建的歌单
    createdPlaylists: [],
    // 收藏的歌单
    subscribedPlaylists: [],
    // 获取喜欢的音乐列表
    likedSongs: [],
    // 登录方法 (1: 手机号, 2: 邮箱, 3: 二维码)
    loginMethod: 1,
    // 二维码相关
    qrCode: {
      key: '',
      qrimg: '',
      status: 0,
    },
    // 登录状态检查定时器
    loginCheckInterval: null,
    // 最后验证时间
    lastVerifyTime: null,
  }),

  getters: {
    // 获取用户ID
    userId: (state) => state.userInfo?.userId || state.userInfo?.account?.id,
    // 获取用户昵称
    nickname: (state) => state.userInfo?.profile?.nickname || state.userDetail?.profile?.nickname,
    // 获取用户头像
    avatarUrl: (state) => state.userInfo?.profile?.avatarUrl || state.userDetail?.profile?.avatarUrl,
    // 判断歌曲是否被喜欢
    isLiked: (state) => (songId) => state.likedSongs.some(song => song.id === songId),
  },

  actions: {
    // 手机号登录 - 网易云官方验证
    async loginByPhone(phone, password, captcha = '') {
      try {
        console.log('开始手机号登录验证...')
        
        const response = await userApi.loginByPhone(phone, password, captcha)
        
        if (response.code === 200) {
          console.log('手机号登录成功', response)
          
          // 设置用户信息并启动状态验证
          this.setUserInfo(response)
          
          // 立即验证登录状态确保有效性
          const isValid = await this.verifyLoginStatus()
          
          if (isValid) {
            return { success: true, message: '登录成功' }
          } else {
            return { success: false, message: '登录状态验证失败' }
          }
        } else if (response.code === 502) {
          return { success: false, message: '账号或密码错误' }
        } else if (response.code === 509) {
          return { success: false, message: '验证码错误' }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error) {
        console.error('手机号登录失败:', error)
        return { success: false, message: '网络错误，请重试' }
      }
    },

    // 邮箱登录 - 网易云官方验证
    async loginByEmail(email, password, captcha = '') {
      try {
        console.log('开始邮箱登录验证...')
        
        const response = await userApi.loginByEmail(email, password, captcha)
        
        if (response.code === 200) {
          console.log('邮箱登录成功', response)
          
          // 设置用户信息并启动状态验证
          this.setUserInfo(response)
          
          // 立即验证登录状态确保有效性
          const isValid = await this.verifyLoginStatus()
          
          if (isValid) {
            return { success: true, message: '登录成功' }
          } else {
            return { success: false, message: '登录状态验证失败' }
          }
        } else if (response.code === 502) {
          return { success: false, message: '账号或密码错误' }
        } else if (response.code === 509) {
          return { success: false, message: '验证码错误' }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error) {
        console.error('邮箱登录失败:', error)
        return { success: false, message: '网络错误，请重试' }
      }
    },

    // 获取二维码
    async getQrCode() {
      try {
        // 获取二维码key
        const keyResponse = await userApi.getQrKey()
        if (keyResponse.code === 200) {
          this.qrCode.key = keyResponse.data.unikey
          
          // 生成二维码
          const qrResponse = await userApi.getQrCode(this.qrCode.key)
          if (qrResponse.code === 200) {
            this.qrCode.qrimg = qrResponse.data.qrimg
            return { success: true }
          }
        }
        return { success: false, message: '获取二维码失败' }
      } catch (error) {
        console.error('获取二维码失败:', error)
        return { success: false, message: '网络错误，请重试' }
      }
    },

    // 获取站内二维码
    async getInternalQrCode() {
      try {
        // 获取二维码key
        const keyResponse = await userApi.getQrKey()
        if (keyResponse.code === 200) {
          this.qrCode.key = keyResponse.data.unikey
          
          // 生成站内二维码
          const qrResponse = await userApi.generateInternalQrCode(this.qrCode.key)
          if (qrResponse.success) {
            this.qrCode.qrimg = qrResponse.data.qrimg
            this.qrCode.qrurl = qrResponse.data.qrurl
            return { success: true }
          }
        }
        return { success: false, message: '获取站内二维码失败' }
      } catch (error) {
        console.error('获取站内二维码失败:', error)
        return { success: false, message: '网络错误，请重试' }
      }
    },

    // 处理站内二维码登录
    async handleInternalQrLogin(key, loginData) {
      try {
        const response = await userApi.handleInternalQrLogin(key, loginData)
        if (response.success) {
          this.setUserInfo(response)
          return { success: true, message: '登录成功' }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error) {
        console.error('处理站内二维码登录失败:', error)
        return { success: false, message: '网络错误，请重试' }
      }
    },

    // 检查二维码状态 - 网易云官方验证
    async checkQrStatus() {
      try {
        const response = await userApi.checkQrStatus(this.qrCode.key)
        this.qrCode.status = response.code
        
        if (response.code === 803) {
          // 登录成功
          console.log('二维码登录成功', response)
          
          // 设置用户信息
          this.setUserInfo(response)
          
          // 立即验证登录状态确保有效性
          const isValid = await this.verifyLoginStatus()
          
          if (isValid) {
            return { success: true, status: 'success', message: '登录成功' }
          } else {
            return { success: false, status: 'failed', message: '登录状态验证失败' }
          }
        } else if (response.code === 801) {
          // 等待扫码
          return { success: true, status: 'waiting' }
        } else if (response.code === 802) {
          // 待确认
          return { success: true, status: 'scanned' }
        } else if (response.code === 800) {
          // 二维码过期
          return { success: false, status: 'expired' }
        } else {
          return { success: false, status: 'error', message: '未知状态' }
        }
      } catch (error) {
        console.error('检查二维码状态失败:', error)
        return { success: false, status: 'error', message: '网络错误' }
      }
    },

    // 设置用户信息
    setUserInfo(response) {
      this.isLoggedIn = true
      this.userInfo = response
      this.lastVerifyTime = Date.now()
      
      // 保存登录信息到本地存储
      if (response.cookie) {
        localStorage.setItem('cookie', response.cookie)
      }
      localStorage.setItem('userInfo', JSON.stringify(response))
      localStorage.setItem('lastVerifyTime', this.lastVerifyTime.toString())
      
      // 获取用户详情和歌单
      this.fetchUserDetail()
      this.fetchUserPlaylists()
      this.fetchLikeList()
      
      // 启动定期验证
      this.scheduleLoginStatusCheck()
    },

    // 获取用户详情
    async fetchUserDetail() {
      try {
        if (this.userId) {
          const response = await userApi.getUserDetail(this.userId)
          if (response.code === 200) {
            this.userDetail = response
          }
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
      }
    },

    // 获取用户歌单
    async fetchUserPlaylists() {
      try {
        if (this.userId) {
          const response = await userApi.getUserPlaylists(this.userId)
          if (response.code === 200) {
            this.userPlaylists = response.playlist
            
            // 分离创建的和收藏的歌单
            this.createdPlaylists = response.playlist.filter(
              playlist => playlist.userId === this.userId
            )
            this.subscribedPlaylists = response.playlist.filter(
              playlist => playlist.userId !== this.userId
            )
          }
        }
      } catch (error) {
        console.error('获取用户歌单失败:', error)
      }
    },

    // 获取喜欢的音乐列表
    async fetchLikeList() {
      try {
        if (this.userId) {
          const response = await userApi.getUserLikeList(this.userId)
          if (response.code === 200) {
            // 将ID列表转换为歌曲对象数组（如果需要）
            this.likedSongs = response.ids || []
          }
        }
      } catch (error) {
        console.error('获取喜欢的音乐列表失败:', error)
      }
    },

    // 添加到喜欢列表
    addToLikedSongs(song) {
      if (!this.likedSongs.some(s => s.id === song.id)) {
        this.likedSongs.unshift(song)
      }
    },

    // 从喜欢列表移除
    removeFromLikedSongs(songId) {
      this.likedSongs = this.likedSongs.filter(song => song.id !== songId)
    },

    // 退出登录
    async logout() {
      try {
        await userApi.logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除状态和本地存储
        this.isLoggedIn = false
        this.userInfo = null
        this.userDetail = null
        this.userPlaylists = []
        this.createdPlaylists = []
        this.subscribedPlaylists = []
        this.likedSongs = []
        this.qrCode = { key: '', qrimg: '', status: 0 }
        this.lastVerifyTime = null
        
        // 清除定时器
        if (this.loginCheckInterval) {
          clearInterval(this.loginCheckInterval)
          this.loginCheckInterval = null
        }
        
        localStorage.removeItem('cookie')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('lastVerifyTime')
      }
    },

    // 从本地存储恢复登录状态 - 网易云官方验证
    async restoreLoginState() {
      const cookie = localStorage.getItem('cookie')
      const userInfo = localStorage.getItem('userInfo')
      const lastVerifyTime = localStorage.getItem('lastVerifyTime')
      
      if (cookie && userInfo) {
        try {
          console.log('开始恢复登录状态...')
          
          this.isLoggedIn = true
          this.userInfo = JSON.parse(userInfo)
          this.lastVerifyTime = lastVerifyTime ? parseInt(lastVerifyTime) : Date.now()
          
          // 检查上次验证时间，如果超过15分钟则立即验证
          const now = Date.now()
          const timeSinceLastVerify = now - this.lastVerifyTime
          const shouldVerifyImmediately = timeSinceLastVerify > 15 * 60 * 1000 // 15分钟
          
          if (shouldVerifyImmediately) {
            console.log('登录状态超过15分钟未验证，立即进行网易云官方验证')
            
            const isValid = await this.verifyLoginStatus()
            
            if (!isValid) {
              console.log('登录状态验证失败，清除本地状态')
              return false // 验证失败，已自动退出登录
            }
          } else {
            // 轻量验证，只加载本地数据
            console.log('恢复登录状态，加载本地数据')
            this.fetchUserDetail()
            this.fetchUserPlaylists()
            this.fetchLikeList()
          }
          
          // 启动定期验证
          this.scheduleLoginStatusCheck()
          
          console.log('登录状态恢复成功')
          return true
          
        } catch (error) {
          console.error('恢复登录状态失败:', error)
          this.logout()
          return false
        }
      }
      
      console.log('未找到本地登录信息')
      return false
    },

    // 验证官方登录状态 - 专用于Login组件的官方登录检查
    async verifyOfficialLogin() {
      try {
        console.log('开始验证网易云官方登录状态...')
        
        // 使用官方验证方法
        const verifyResult = await userApi.getOfficialLoginStatus()
        
        if (verifyResult.isValid) {
          console.log('网易云官方登录状态验证成功', verifyResult)
          
          // 设置用户信息并保存到本地
          const loginData = {
            code: 200,
            account: verifyResult.account,
            profile: verifyResult.profile,
            cookie: document.cookie // 获取当前cookie
          }
          
          this.setUserInfo(loginData)
          
          return {
            isValid: true,
            code: 200,
            account: verifyResult.account,
            profile: verifyResult.profile,
            message: '官方登录状态有效'
          }
        } else {
          console.log('网易云官方登录状态验证失败:', verifyResult.message)
          return {
            isValid: false,
            code: verifyResult.code || -1,
            message: verifyResult.message || '未检测到官方登录状态'
          }
        }
      } catch (error) {
        console.error('验证网易云官方登录状态失败:', error)
        return {
          isValid: false,
          code: -1,
          message: '网络错误或接口异常',
          error
        }
      }
    },

    // 从网易云音乐web版同步登录状态
    async syncLoginFromWeb() {
      try {
        console.log('开始从网易云音乐web版同步登录状态...')
        
        const result = await userApi.syncLoginFromWeb()
        
        if (result.success) {
          console.log('成功从web版同步登录状态:', result)
          
          // 设置用户信息
          const loginData = {
            code: 200,
            account: result.account,
            profile: result.profile,
            userDetail: result.userDetail,
            cookie: result.cookie
          }
          
          this.setUserInfo(loginData)
          
          return {
            success: true,
            code: 200,
            account: result.account,
            profile: result.profile,
            message: '成功从网易云音乐web版同步登录状态'
          }
        } else {
          console.log('从web版同步登录状态失败:', result.message)
          return {
            success: false,
            code: result.code || -1,
            message: result.message || '未检测到web版登录状态'
          }
        }
      } catch (error) {
        console.error('从web版同步登录状态失败:', error)
        return {
          success: false,
          code: -1,
          message: '同步登录状态时发生错误',
          error
        }
      }
    },

    // 轮询检查web版登录状态
    async pollWebLoginStatus(options = {}) {
      const defaultOptions = {
        maxAttempts: 30,
        interval: 2000,
        onProgress: null,
        onSuccess: null,
        onError: null
      }
      
      const finalOptions = { ...defaultOptions, ...options }
      
      try {
        console.log('开始轮询检查web版登录状态...')
        
        const result = await userApi.pollWebLoginStatus({
          ...finalOptions,
          onProgress: (progress) => {
            console.log('轮询进度:', progress)
            if (finalOptions.onProgress) {
              finalOptions.onProgress(progress)
            }
          },
          onSuccess: (result) => {
            console.log('轮询检查成功:', result)
            
            // 设置用户信息
            const loginData = {
              code: 200,
              account: result.account,
              profile: result.profile,
              userDetail: result.userDetail,
              cookie: result.cookie
            }
            
            this.setUserInfo(loginData)
            
            if (finalOptions.onSuccess) {
              finalOptions.onSuccess(result)
            }
          },
          onError: (error) => {
            console.log('轮询检查失败:', error)
            if (finalOptions.onError) {
              finalOptions.onError(error)
            }
          }
        })
        
        return result
      } catch (error) {
        console.error('轮询检查web版登录状态失败:', error)
        return {
          success: false,
          code: -1,
          message: '轮询检查时发生错误',
          error
        }
      }
    },

    // 检查跨域cookie
    async checkCrossDomainCookie() {
      try {
        console.log('开始检查跨域cookie...')
        
        const result = await userApi.checkCrossDomainCookie()
        
        if (result.success) {
          console.log('跨域cookie检查成功:', result)
          
          // 设置用户信息
          const loginData = {
            code: 200,
            account: result.account,
            profile: result.profile,
            userDetail: result.userDetail,
            cookie: result.cookie
          }
          
          this.setUserInfo(loginData)
        }
        
        return result
      } catch (error) {
        console.error('检查跨域cookie失败:', error)
        return {
          success: false,
          code: -1,
          message: '检查跨域cookie时发生错误',
          error
        }
      }
    },

    // 验证登录状态 - 使用网易云官方接口
    async verifyLoginStatus() {
      try {
        console.log('开始验证登录状态...')
        
        // 使用综合验证方法，优先使用官方接口
        const verifyResult = await userApi.comprehensiveLoginCheck()
        
        if (verifyResult.isValid) {
          console.log('登录状态验证成功', verifyResult)
          
          // 更新本地用户信息
          if (verifyResult.account || verifyResult.profile) {
            this.userInfo = {
              ...this.userInfo,
              account: verifyResult.account || this.userInfo?.account,
              profile: verifyResult.profile || this.userInfo?.profile
            }
            
            // 保存到本地存储
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          }
          
          // 获取最新数据
          this.fetchUserDetail()
          this.fetchUserPlaylists()
          this.fetchLikeList()
          
          this.lastVerifyTime = Date.now()
          localStorage.setItem('lastVerifyTime', this.lastVerifyTime.toString())
          
          return true
        } else {
          console.log('登录状态验证失败:', verifyResult.message)
          
          // 根据不同的错误类型做不同处理
          if (verifyResult.code === 301 || verifyResult.code === 400 || verifyResult.code === 401) {
            // 需要重新登录
            console.log('登录已过期，需要重新登录')
            this.logout()
          } else if (verifyResult.error && (verifyResult.error.code === 'NETWORK_ERROR' || verifyResult.message?.includes('网络'))) {
            // 网络错误，不立即退出登录
            console.log('网络错误，保持当前状态')
            return false
          } else {
            // 其他错误，退出登录
            this.logout()
          }
          
          return false
        }
      } catch (error) {
        console.error('验证登录状态发生异常:', error)
        
        // 网络异常不立即退出登录
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('network') || error.message?.includes('网络')) {
          console.log('网络异常，保持当前状态')
          return false
        }
        
        this.logout()
        return false
      }
    },

    // 定期验证登录状态
    async scheduleLoginStatusCheck() {
      // 每5分钟检查一次登录状态
      if (this.loginCheckInterval) {
        clearInterval(this.loginCheckInterval)
      }
      
      if (this.isLoggedIn) {
        this.loginCheckInterval = setInterval(async () => {
          if (this.isLoggedIn) {
            await this.verifyLoginStatus()
          }
        }, 5 * 60 * 1000) // 5分钟
      }
    },

    // 刷新登录状态
    async refreshLoginStatus() {
      try {
        const response = await userApi.refreshLoginStatus()
        if (response.code === 200) {
          console.log('登录状态刷新成功')
          return true
        }
        return false
      } catch (error) {
        console.error('刷新登录状态失败:', error)
        return false
      }
    },

    // 设置登录方法
    setLoginMethod(method) {
      this.loginMethod = method
    },
  },
})