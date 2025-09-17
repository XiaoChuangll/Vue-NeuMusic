// API 服务统一导出
export { userApi } from './user.js'
export { musicApi } from './music.js'
export { default as request, setApiUrl, getApiUrl } from './request.js'

// 工具函数
export const utils = {
  // 格式化时间
  formatTime(time) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  // 格式化播放次数
  formatPlayCount(count) {
    if (count < 10000) {
      return count.toString()
    } else if (count < 100000000) {
      return `${Math.floor(count / 10000)}万`
    } else {
      return `${Math.floor(count / 100000000)}亿`
    }
  },

  // 格式化文件大小
  formatFileSize(size) {
    if (size < 1024) {
      return `${size}B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)}KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)}MB`
    }
  },

  // 获取图片URL (添加参数以获得不同尺寸)
  getImageUrl(url, size = 300) {
    if (!url) return ''
    return `${url}?param=${size}y${size}`
  },

  // 防抖函数
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },
}