import request from './request.js'

// 用户登录相关 API
export const userApi = {
  // 手机号登录 - 网易云官方验证
  loginByPhone(phone, password, captcha = '', countrycode = '86') {
    return request({
      url: '/login/cellphone',
      method: 'post',
      data: {
        phone,
        password,
        captcha,
        countrycode,
        timestamp: Date.now(),
      },
    })
  },

  // 邮箱登录 - 网易云官方验证
  loginByEmail(email, password, captcha = '') {
    return request({
      url: '/login',
      method: 'post',
      data: {
        email,
        password,
        captcha,
        timestamp: Date.now(),
      },
    })
  },

  // 二维码登录 - 获取二维码key
  getQrKey() {
    return request({
      url: '/login/qr/key',
      method: 'get',
      params: {
        timestamp: Date.now(),
      },
    })
  },

  // 二维码登录 - 生成二维码
  getQrCode(key) {
    return request({
      url: '/login/qr/create',
      method: 'get',
      params: {
        key,
        qrimg: true,
        timestamp: Date.now(),
      },
    })
  },

  // 生成站内二维码
  async generateInternalQrCode(key) {
    try {
      // 生成指向站内的二维码内容
      const internalLoginUrl = `${window.location.origin}/login/qr?key=${key}&t=${Date.now()}`
      
      // 使用第三方二维码生成服务或本地生成
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(internalLoginUrl)}`
      
      return {
        success: true,
        code: 200,
        data: {
          qrimg: qrCodeUrl,
          qrurl: internalLoginUrl
        }
      }
    } catch (error) {
      console.error('生成站内二维码失败:', error)
      return {
        success: false,
        code: -1,
        message: '生成二维码失败'
      }
    }
  },

  // 处理站内二维码扫描登录
  async handleInternalQrLogin(key, loginData) {
    try {
      // 验证key的有效性
      if (!key) {
        return { success: false, message: '无效的登录key' }
      }
      
      // 这里可以实现自定义的登录逻辑
      // 比如使用手机APP扫码后，APP调用这个接口传递登录信息
      const response = await request({
        url: '/login/qr/confirm',
        method: 'post',
        data: {
          key,
          ...loginData,
          timestamp: Date.now(),
        },
      })
      
      return response
    } catch (error) {
      console.error('处理站内二维码登录失败:', error)
      return {
        success: false,
        message: '登录处理失败'
      }
    }
  },

  // 二维码登录 - 检查二维码状态
  checkQrStatus(key) {
    return request({
      url: '/login/qr/check',
      method: 'get',
      params: {
        key,
        timestamp: Date.now(),
      },
    })
  },

  // 获取登录状态 - 网易云官方状态检查
  getLoginStatus() {
    return request({
      url: '/login/status',
      method: 'post',
      params: {
        timestamp: Date.now(),
      },
    })
  },

  // 检查登录状态 (更精确的验证) - 获取账号信息
  checkLoginStatus() {
    return request({
      url: '/user/account',
      method: 'get',
      params: {
        timestamp: Date.now(),
      },
    })
  },

  // 验证登录状态 - 综合验证
  async verifyLoginStatus() {
    try {
      // 第一步：检查基础登录状态
      const statusResult = await this.getLoginStatus()
      
      if (statusResult.data?.code !== 200) {
        return {
          isValid: false,
          code: statusResult.data?.code || -1,
          message: '登录状态无效'
        }
      }

      // 第二步：验证账号信息
      const accountResult = await this.checkLoginStatus()
      
      if (accountResult.code === 200 && accountResult.account) {
        return {
          isValid: true,
          code: 200,
          account: accountResult.account,
          profile: accountResult.profile,
          message: '登录状态有效'
        }
      }

      return {
        isValid: false,
        code: accountResult.code || -1,
        message: '账号信息验证失败'
      }
    } catch (error) {
      console.error('验证登录状态失败:', error)
      return {
        isValid: false,
        code: -1,
        message: '网络错误',
        error
      }
    }
  },

  // 从网易云音乐官网获取登录状态
  async getOfficialLoginStatus() {
    try {
      // 使用网易云音乐官方接口检查登录状态
      const response = await fetch('https://music.163.com/api/nuser/account/get', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Referer': 'https://music.163.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          isValid: data.code === 200 && data.account,
          code: data.code,
          account: data.account,
          profile: data.profile,
          message: data.code === 200 ? '登录状态有效' : '登录状态无效'
        }
      } else {
        return {
          isValid: false,
          code: response.status,
          message: '网络请求失败'
        }
      }
    } catch (error) {
      console.error('获取官方登录状态失败:', error)
      return {
        isValid: false,
        code: -1,
        message: '网络错误',
        error
      }
    }
  },

  // 从网易云音乐官网获取Cookie并同步登录状态
  async syncLoginFromWeb() {
    try {
      console.log('开始从网易云音乐web版同步登录状态...')
      
      // 检查是否有可用的cookie
      const cookieString = document.cookie
      console.log('当前cookie状态:', cookieString ? '存在' : '无')
      
      // 尝试获取登录状态
      const statusResult = await this.getOfficialLoginStatus()
      
      if (statusResult.isValid) {
        console.log('检测到网易云音乐web版登录状态:', statusResult)
        
        // 获取详细的用户信息
        const userDetailResponse = await fetch('https://music.163.com/api/v1/user/detail/' + statusResult.account.id, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Referer': 'https://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        let userDetail = null
        if (userDetailResponse.ok) {
          const detailData = await userDetailResponse.json()
          if (detailData.code === 200) {
            userDetail = detailData
          }
        }
        
        return {
          success: true,
          code: 200,
          account: statusResult.account,
          profile: statusResult.profile,
          userDetail: userDetail,
          cookie: cookieString,
          message: '成功从网易云音乐web版同步登录状态'
        }
      } else {
        return {
          success: false,
          code: statusResult.code || -1,
          message: statusResult.message || '未检测到网易云音乐web版登录状态'
        }
      }
    } catch (error) {
      console.error('同步网易云音乐web版登录状态失败:', error)
      return {
        success: false,
        code: -1,
        message: '同步登录状态时发生错误',
        error
      }
    }
  },

  // 轮询检查网易云音乐web版登录状态
  async pollWebLoginStatus(options = {}) {
    const {
      maxAttempts = 30,        // 最大尝试次数（30次，约1分钟）
      interval = 2000,         // 检查间隔（2秒）
      onProgress = null,       // 进度回调
      onSuccess = null,        // 成功回调
      onError = null          // 错误回调
    } = options
    
    let attempts = 0
    
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        attempts++
        
        try {
          if (onProgress) {
            onProgress({
              attempts,
              maxAttempts,
              message: `正在检查登录状态... (${attempts}/${maxAttempts})`
            })
          }
          
          const result = await this.syncLoginFromWeb()
          
          if (result.success) {
            if (onSuccess) {
              onSuccess(result)
            }
            resolve(result)
            return
          }
          
          // 如果达到最大尝试次数，返回失败
          if (attempts >= maxAttempts) {
            const errorResult = {
              success: false,
              code: -1,
              message: `已尝试${maxAttempts}次，未检测到登录状态`
            }
            
            if (onError) {
              onError(errorResult)
            }
            resolve(errorResult)
            return
          }
          
          // 继续下一次检查
          setTimeout(checkStatus, interval)
          
        } catch (error) {
          console.error('轮询检查登录状态时发生错误:', error)
          
          const errorResult = {
            success: false,
            code: -1,
            message: '检查登录状态时发生错误',
            error
          }
          
          if (onError) {
            onError(errorResult)
          }
          reject(errorResult)
        }
      }
      
      // 开始第一次检查
      checkStatus()
    })
  },

  // 检查和同步跨域cookie
  async checkCrossDomainCookie() {
    try {
      // 尝试通过iframe获取网易云音乐的cookie
      return new Promise((resolve) => {
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = 'https://music.163.com/api/nuser/account/get'
        
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe)
          resolve({
            success: false,
            message: '检查cookie超时'
          })
        }, 5000)
        
        iframe.onload = async () => {
          clearTimeout(timeout)
          
          try {
            // 检查登录状态
            const result = await this.syncLoginFromWeb()
            document.body.removeChild(iframe)
            resolve(result)
          } catch (error) {
            document.body.removeChild(iframe)
            resolve({
              success: false,
              message: '获取登录状态失败',
              error
            })
          }
        }
        
        iframe.onerror = () => {
          clearTimeout(timeout)
          document.body.removeChild(iframe)
          resolve({
            success: false,
            message: '无法访问网易云音乐'
          })
        }
        
        document.body.appendChild(iframe)
      })
    } catch (error) {
      console.error('检查跨域cookie失败:', error)
      return {
        success: false,
        message: '检查cookie时发生错误',
        error
      }
    }
  },

  // 综合登录状态验证 - 优先使用官方接口
  async comprehensiveLoginCheck() {
    try {
      // 首先尝试官方接口
      const officialResult = await this.getOfficialLoginStatus()
      
      if (officialResult.isValid) {
        console.log('官方接口验证成功')
        return officialResult
      }
      
      // 官方接口失败，使用备用接口
      console.log('官方接口验证失败，使用备用接口')
      return await this.verifyLoginStatus()
      
    } catch (error) {
      console.error('综合登录状态检查失败:', error)
      // 最后备用方案
      return await this.verifyLoginStatus()
    }
  },

  // 刷新登录状态
  refreshLoginStatus() {
    return request({
      url: '/login/refresh',
      method: 'post',
    })
  },

  // 退出登录
  logout() {
    return request({
      url: '/logout',
      method: 'post',
    })
  },

  // 获取用户详情
  getUserDetail(uid) {
    return request({
      url: '/user/detail',
      method: 'get',
      params: {
        uid,
      },
    })
  },

  // 获取用户账号信息
  getUserAccount() {
    return request({
      url: '/user/account',
      method: 'get',
    })
  },

  // 获取用户歌单
  getUserPlaylists(uid, limit = 30, offset = 0) {
    return request({
      url: '/user/playlist',
      method: 'get',
      params: {
        uid,
        limit,
        offset,
      },
    })
  },

  // 获取用户喜欢的音乐列表
  getUserLikeList(uid) {
    return request({
      url: '/likelist',
      method: 'get',
      params: {
        uid,
      },
    })
  },

  // 获取用户关注的歌手
  getUserFollowedArtists(limit = 30, offset = 0) {
    return request({
      url: '/artist/sublist',
      method: 'get',
      params: {
        limit,
        offset,
      },
    })
  },

  // 获取用户收藏的专辑
  getUserFollowedAlbums(limit = 30, offset = 0) {
    return request({
      url: '/album/sublist',
      method: 'get',
      params: {
        limit,
        offset,
      },
    })
  },

  // 获取用户收藏的MV
  getUserFollowedMVs(limit = 30, offset = 0) {
    return request({
      url: '/mv/sublist',
      method: 'get',
      params: {
        limit,
        offset,
      },
    })
  },

  // 登录状态刷新
  refreshLogin() {
    return request({
      url: '/login/refresh',
      method: 'post',
    })
  },
}