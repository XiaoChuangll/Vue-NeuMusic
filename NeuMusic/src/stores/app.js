import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // API 地址
    apiUrl: localStorage.getItem('apiUrl') || 'http://139.9.223.233:3000/',
    // 当前页面
    currentPage: 'home',
    // 加载状态
    loading: false,
    // 搜索关键词
    searchKeyword: '',
    // 搜索类型 (1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单)
    searchType: 1,
    // 主题设置
    theme: localStorage.getItem('theme') || 'light',
    // 语言设置
    language: localStorage.getItem('language') || 'zh-CN',
    // 是否显示歌词
    showLyrics: localStorage.getItem('showLyrics') === 'true',
    // 歌词位置
    lyricsPosition: localStorage.getItem('lyricsPosition') || 'bottom',
    // 播放质量
    audioQuality: localStorage.getItem('audioQuality') || 'standard',
    // 自动播放
    autoPlay: localStorage.getItem('autoPlay') !== 'false',
    // 错误信息
    errorMessage: '',
    // 成功信息
    successMessage: '',
    // 模态框状态
    modals: {
      artistModal: false,
      playlistModal: false,
      settingsModal: false,
    },
    // 当前歌单ID（用于模态框）
    currentPlaylistId: null,
    // 当前歌手ID（用于模态框）
    currentArtistId: null,
  }),

  getters: {
    // 获取搜索类型文本
    searchTypeText: (state) => {
      const types = {
        1: '单曲',
        10: '专辑', 
        100: '歌手',
        1000: '歌单',
      }
      return types[state.searchType] || '单曲'
    },
    
    // 获取音质文本
    audioQualityText: (state) => {
      const qualities = {
        standard: '标准',
        high: '高品质',
        lossless: '无损',
      }
      return qualities[state.audioQuality] || '标准'
    },
    
    // 获取音质对应的比特率
    audioBitrate: (state) => {
      const bitrates = {
        standard: 128000,
        high: 320000,
        lossless: 999000,
      }
      return bitrates[state.audioQuality] || 128000
    },
  },

  actions: {
    // 设置当前页面
    setCurrentPage(page) {
      this.currentPage = page
    },

    // 设置加载状态
    setLoading(loading) {
      this.loading = loading
    },

    // 设置 API 地址
    setApiUrl(url) {
      this.apiUrl = url
      localStorage.setItem('apiUrl', url)
      
      // 重新设置请求的 baseURL
      import('@/services/request.js').then(({ setApiUrl }) => {
        setApiUrl(url)
      })
    },

    // 设置搜索关键词
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword
    },

    // 设置搜索类型
    setSearchType(type) {
      this.searchType = type
    },

    // 设置主题
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
      
      // 应用主题到 document
      document.documentElement.setAttribute('data-theme', theme)
    },

    // 设置语言
    setLanguage(language) {
      this.language = language
      localStorage.setItem('language', language)
    },

    // 设置歌词显示
    setShowLyrics(show) {
      this.showLyrics = show
      localStorage.setItem('showLyrics', show.toString())
    },

    // 设置歌词位置
    setLyricsPosition(position) {
      this.lyricsPosition = position
      localStorage.setItem('lyricsPosition', position)
    },

    // 设置音质
    setAudioQuality(quality) {
      this.audioQuality = quality
      localStorage.setItem('audioQuality', quality)
    },

    // 设置自动播放
    setAutoPlay(autoPlay) {
      this.autoPlay = autoPlay
      localStorage.setItem('autoPlay', autoPlay.toString())
    },

    // 显示错误信息
    showError(message, duration = 3000) {
      this.errorMessage = message
      if (duration > 0) {
        setTimeout(() => {
          this.errorMessage = ''
        }, duration)
      }
    },

    // 显示成功信息
    showSuccess(message, duration = 3000) {
      this.successMessage = message
      if (duration > 0) {
        setTimeout(() => {
          this.successMessage = ''
        }, duration)
      }
    },

    // 清除消息
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },

    // 显示模态框
    showModal(modalName) {
      this.modals[modalName] = true
    },

    // 隐藏模态框
    hideModal(modalName) {
      this.modals[modalName] = false
    },

    // 隐藏所有模态框
    hideAllModals() {
      Object.keys(this.modals).forEach(key => {
        this.modals[key] = false
      })
    },

    // 设置当前歌单ID并显示模态框
    showPlaylistModal(playlistId) {
      this.currentPlaylistId = playlistId
      this.showModal('playlistModal')
    },

    // 设置当前歌手ID并显示模态框
    showArtistModal(artistId) {
      this.currentArtistId = artistId
      this.showModal('artistModal')
    },

    // 显示信息提示
    showInfo(message, duration = 3000) {
      // 可以使用和 showSuccess 相同的逻辑
      this.showSuccess(message, duration)
    },

    // 初始化应用设置
    initializeApp() {
      // 应用主题
      document.documentElement.setAttribute('data-theme', this.theme)
      
      // 设置 API 地址
      import('@/services/request.js').then(({ setApiUrl }) => {
        setApiUrl(this.apiUrl)
      })
    },

    // 重置应用设置
    resetSettings() {
      this.apiUrl = 'http://139.9.223.233:3000/'
      this.theme = 'light'
      this.language = 'zh-CN'
      this.showLyrics = false
      this.lyricsPosition = 'bottom'
      this.audioQuality = 'standard'
      this.autoPlay = true
      
      // 清除本地存储
      const keys = ['apiUrl', 'theme', 'language', 'showLyrics', 'lyricsPosition', 'audioQuality', 'autoPlay']
      keys.forEach(key => localStorage.removeItem(key))
      
      // 重新初始化
      this.initializeApp()
    },
  },
})