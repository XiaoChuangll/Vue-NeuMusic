import { defineStore } from 'pinia'
import { musicApi } from '@/services'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    // 播放状态
    isPlaying: false,
    // 当前播放歌曲
    currentSong: null,
    // 播放列表
    playlist: [],
    // 当前播放索引
    currentIndex: 0,
    // 播放模式 (0: 顺序播放, 1: 单曲循环, 2: 随机播放)
    playMode: 0,
    // 播放时间
    currentTime: 0,
    // 总时长
    duration: 0,
    // 音量
    volume: 0.8,
    // 音乐URL
    currentUrl: '',
    // 歌词
    lyric: null,
    // 随机播放的索引数组
    shuffledIndexes: [],
    // 当前随机播放索引
    shuffledIndex: 0,
    // 播放历史
    playHistory: [],
    // 音频对象
    audio: null,
  }),

  getters: {
    // 播放进度百分比
    progress: (state) => {
      if (!state.duration) return 0
      return (state.currentTime / state.duration) * 100
    },
    
    // 格式化当前时间
    formattedCurrentTime: (state) => {
      return formatTime(state.currentTime)
    },
    
    // 格式化总时长
    formattedDuration: (state) => {
      return formatTime(state.duration)
    },
    
    // 是否有上一首
    hasPrevious: (state) => {
      if (state.playMode === 2) {
        // 随机播放
        return state.shuffledIndex > 0
      }
      return state.currentIndex > 0
    },
    
    // 是否有下一首
    hasNext: (state) => {
      if (state.playMode === 2) {
        // 随机播放
        return state.shuffledIndex < state.shuffledIndexes.length - 1
      }
      return state.currentIndex < state.playlist.length - 1
    },
    
    // 播放模式文本
    playModeText: (state) => {
      const modes = ['顺序播放', '单曲循环', '随机播放']
      return modes[state.playMode]
    },
  },

  actions: {
    // 初始化音频对象
    initAudio() {
      if (!this.audio) {
        this.audio = new Audio()
        this.audio.volume = this.volume
        
        // 监听播放事件
        this.audio.addEventListener('play', () => {
          this.isPlaying = true
        })
        
        this.audio.addEventListener('pause', () => {
          this.isPlaying = false
        })
        
        this.audio.addEventListener('ended', () => {
          this.next()
        })
        
        this.audio.addEventListener('timeupdate', () => {
          this.currentTime = this.audio.currentTime
        })
        
        this.audio.addEventListener('durationchange', () => {
          this.duration = this.audio.duration || 0
        })
        
        this.audio.addEventListener('error', (e) => {
          console.error('音频播放错误:', e)
          this.next()
        })
      }
    },

    // 播放歌曲
    async playSong(song, playlist = null, index = 0) {
      if (playlist) {
        this.playlist = playlist
        this.currentIndex = index
        this.generateShuffledIndexes()
      }
      
      this.currentSong = song
      
      // 添加到播放历史
      this.addToHistory(song)
      
      // 获取播放URL
      await this.getSongUrl(song.id)
      
      // 获取歌词
      await this.getLyric(song.id)
      
      // 保存到本地存储
      this.saveToLocalStorage()
    },

    // 获取歌曲播放URL
    async getSongUrl(id) {
      try {
        const response = await musicApi.getSongUrl(id)
        if (response.code === 200 && response.data[0]?.url) {
          this.currentUrl = response.data[0].url
          
          // 设置音频源并播放
          if (this.audio) {
            this.audio.src = this.currentUrl
            this.play()
          }
        } else {
          console.error('获取播放URL失败')
          this.next()
        }
      } catch (error) {
        console.error('获取播放URL失败:', error)
        this.next()
      }
    },

    // 获取歌词
    async getLyric(id) {
      try {
        const response = await musicApi.getLyric(id)
        if (response.code === 200) {
          this.lyric = response
        }
      } catch (error) {
        console.error('获取歌词失败:', error)
        this.lyric = null
      }
    },

    // 播放
    play() {
      if (this.audio && this.currentUrl) {
        this.audio.play().catch(error => {
          console.error('播放失败:', error)
        })
      }
    },

    // 暂停
    pause() {
      if (this.audio) {
        this.audio.pause()
      }
    },

    // 播放/暂停切换
    togglePlay() {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },

    // 上一首
    previous() {
      if (!this.playlist.length) return
      
      if (this.playMode === 2) {
        // 随机播放
        if (this.shuffledIndex > 0) {
          this.shuffledIndex--
          this.currentIndex = this.shuffledIndexes[this.shuffledIndex]
        }
      } else {
        // 顺序播放
        this.currentIndex = this.currentIndex > 0 
          ? this.currentIndex - 1 
          : this.playlist.length - 1
      }
      
      this.playSong(this.playlist[this.currentIndex])
    },

    // 下一首
    next() {
      if (!this.playlist.length) return
      
      if (this.playMode === 1) {
        // 单曲循环
        this.play()
        return
      }
      
      if (this.playMode === 2) {
        // 随机播放
        if (this.shuffledIndex < this.shuffledIndexes.length - 1) {
          this.shuffledIndex++
          this.currentIndex = this.shuffledIndexes[this.shuffledIndex]
        } else {
          // 重新洗牌
          this.generateShuffledIndexes()
          this.shuffledIndex = 0
          this.currentIndex = this.shuffledIndexes[0]
        }
      } else {
        // 顺序播放
        this.currentIndex = this.currentIndex < this.playlist.length - 1 
          ? this.currentIndex + 1 
          : 0
      }
      
      this.playSong(this.playlist[this.currentIndex])
    },

    // 切换播放模式
    togglePlayMode() {
      this.playMode = (this.playMode + 1) % 3
      
      if (this.playMode === 2) {
        // 切换到随机播放时生成随机索引
        this.generateShuffledIndexes()
      }
      
      this.saveToLocalStorage()
    },

    // 生成随机播放索引
    generateShuffledIndexes() {
      this.shuffledIndexes = [...Array(this.playlist.length).keys()]
      
      // Fisher-Yates 洗牌算法
      for (let i = this.shuffledIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.shuffledIndexes[i], this.shuffledIndexes[j]] = 
         [this.shuffledIndexes[j], this.shuffledIndexes[i]]
      }
      
      // 找到当前歌曲在随机数组中的位置
      this.shuffledIndex = this.shuffledIndexes.indexOf(this.currentIndex)
    },

    // 设置播放列表并播放指定歌曲
    setPlaylist(songs, index = 0) {
      this.playlist = songs
      this.currentIndex = index
      this.generateShuffledIndexes()
      
      if (songs.length > 0 && index < songs.length) {
        this.playSong(songs[index])
      }
    },

    // 跳转到指定时间
    seek(time) {
      if (this.audio && this.duration) {
        const seekTime = Math.max(0, Math.min(time, this.duration))
        this.audio.currentTime = seekTime
        this.currentTime = seekTime
      }
    },

    // 静音/取消静音
    toggleMute() {
      if (this.audio) {
        this.audio.muted = !this.audio.muted
      }
    },

    // 获取静音状态
    get isMuted() {
      return this.audio ? this.audio.muted : false
    },

    // 设置音量
    setVolume(volume) {
      this.volume = volume
      if (this.audio) {
        this.audio.volume = volume
      }
      this.saveToLocalStorage()
    },

    // 添加歌曲到播放列表
    addToPlaylist(song) {
      const existingIndex = this.playlist.findIndex(s => s.id === song.id)
      if (existingIndex === -1) {
        this.playlist.push(song)
      }
    },

    // 从播放列表移除歌曲
    removeFromPlaylist(index) {
      if (index < this.currentIndex) {
        this.currentIndex--
      } else if (index === this.currentIndex) {
        // 如果删除的是当前播放的歌曲
        if (this.playlist.length > 1) {
          this.next()
        } else {
          this.currentSong = null
          this.pause()
        }
      }
      
      this.playlist.splice(index, 1)
      
      if (this.playMode === 2) {
        // 重新生成随机索引
        this.generateShuffledIndexes()
      }
    },

    // 清空播放列表
    clearPlaylist() {
      this.playlist = []
      this.currentIndex = 0
      this.currentSong = null
      this.shuffledIndexes = []
      this.shuffledIndex = 0
      this.pause()
    },

    // 添加到播放历史
    addToHistory(song) {
      const existingIndex = this.playHistory.findIndex(s => s.id === song.id)
      if (existingIndex !== -1) {
        this.playHistory.splice(existingIndex, 1)
      }
      
      this.playHistory.unshift({
        ...song,
        playTime: Date.now()
      })
      
      // 限制历史记录数量
      if (this.playHistory.length > 100) {
        this.playHistory = this.playHistory.slice(0, 100)
      }
    },

    // 保存到本地存储
    saveToLocalStorage() {
      const data = {
        currentSong: this.currentSong,
        playlist: this.playlist,
        currentIndex: this.currentIndex,
        playMode: this.playMode,
        volume: this.volume,
        playHistory: this.playHistory,
      }
      localStorage.setItem('playerState', JSON.stringify(data))
    },

    // 从本地存储恢复状态
    restoreFromLocalStorage() {
      const data = localStorage.getItem('playerState')
      if (data) {
        try {
          const state = JSON.parse(data)
          this.currentSong = state.currentSong
          this.playlist = state.playlist || []
          this.currentIndex = state.currentIndex || 0
          this.playMode = state.playMode || 0
          this.volume = state.volume || 0.8
          this.playHistory = state.playHistory || []
          
          // 设置音量
          if (this.audio) {
            this.audio.volume = this.volume
          }
          
          if (this.playMode === 2 && this.playlist.length) {
            this.generateShuffledIndexes()
          }
          
          console.log('播放器状态恢复成功')
        } catch (error) {
          console.error('恢复播放状态失败:', error)
        }
      }
    },

    // 获取播放历史
    getPlayHistory(limit = 20) {
      return this.playHistory.slice(0, limit)
    },

    // 清空播放历史
    clearPlayHistory() {
      this.playHistory = []
      this.saveToLocalStorage()
    },

    // 销毁播放器
    destroy() {
      if (this.audio) {
        this.audio.pause()
        this.audio.src = ''
        this.audio = null
      }
    },
  },
})

// 格式化时间的辅助函数
function formatTime(time) {
  if (!time || time === Infinity || isNaN(time)) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}