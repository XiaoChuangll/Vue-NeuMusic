<template>
  <div class="modal-overlay" :class="{ active: isVisible }" @click="handleOverlayClick">
    <div class="modal-container settings-modal" @click.stop>
      <div class="modal-header">
        <h2>设置</h2>
        <button class="modal-close" @click="close">&times;</button>
      </div>
      <div class="modal-content">
        <div class="settings-section">
          <h3>接口设置</h3>
          <div class="setting-item api-url-item">
            <label>网易云 API 地址</label>
            <div class="api-url-input">
              <input type="text" v-model="apiUrl" placeholder="例如 http://localhost:3000/" />
              <button class="neu-button" @click="applyApiUrl">应用</button>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <h3>播放设置</h3>
          <div class="setting-item">
            <label>音质偏好</label>
            <select v-model="settings.audioQuality" @change="updateSetting('audioQuality', $event.target.value)">
              <option value="128000">标准品质 128kbps</option>
              <option value="192000">较高品质 192kbps</option>
              <option value="320000">极高品质 320kbps</option>
              <option value="999000">无损品质</option>
            </select>
          </div>
          <div class="setting-item">
            <label>自动播放</label>
            <input 
              type="checkbox" 
              v-model="settings.autoPlay" 
              @change="updateSetting('autoPlay', $event.target.checked)"
            />
          </div>
          <div class="setting-item">
            <label>淡入淡出</label>
            <input 
              type="checkbox" 
              v-model="settings.crossfade" 
              @change="updateSetting('crossfade', $event.target.checked)"
            />
          </div>
        </div>
        
        <div class="settings-section">
          <h3>界面设置</h3>
          <div class="setting-item">
            <label>主题色彩</label>
            <select v-model="settings.theme" @change="updateSetting('theme', $event.target.value)">
              <option value="auto">跟随系统</option>
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
            </select>
          </div>
          <div class="setting-item">
            <label>紧凑模式</label>
            <input 
              type="checkbox" 
              v-model="settings.compactMode" 
              @change="updateSetting('compactMode', $event.target.checked)"
            />
          </div>
        </div>
        
        <div class="settings-section">
          <h3>其他设置</h3>
          <div class="setting-item">
            <label>显示歌词</label>
            <input 
              type="checkbox" 
              v-model="settings.showLyrics" 
              @change="updateSetting('showLyrics', $event.target.checked)"
            />
          </div>
          <div class="setting-item">
            <label>下载位置</label>
            <div class="download-path">
              <input type="text" v-model="settings.downloadPath" readonly />
              <button class="neu-button" @click="selectDownloadPath">选择</button>
            </div>
          </div>
        </div>
        
        <div class="settings-actions">
          <button class="neu-button" @click="resetSettings">恢复默认</button>
          <button class="neu-button primary" @click="saveSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

const isVisible = computed(() => appStore.modals.settingsModal)

// API URL 配置
const apiUrl = ref(appStore.apiUrl)

// 默认设置
const defaultSettings = {
  audioQuality: '320000',
  autoPlay: true,
  crossfade: false,
  theme: 'auto',
  compactMode: false,
  showLyrics: true,
  downloadPath: './downloads'
}

// 当前设置
const settings = reactive({ ...defaultSettings })

// 加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('neumusic-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings, { ...defaultSettings, ...parsed })
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 更新单个设置
const updateSetting = (key, value) => {
  settings[key] = value
  saveSettings()
}

// 保存设置
const saveSettings = () => {
  try {
    localStorage.setItem('neumusic-settings', JSON.stringify(settings))
    appStore.showSuccess('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    appStore.showError('保存设置失败')
  }
}

// 重置设置
const resetSettings = () => {
  Object.assign(settings, defaultSettings)
  saveSettings()
  appStore.showSuccess('已恢复默认设置')
}

// 选择下载路径
const selectDownloadPath = () => {
  // 在真实应用中，这里会打开文件选择对话框
  appStore.showInfo('文件选择功能需要在桌面应用中实现')
}

// 应用 API 地址
const applyApiUrl = () => {
  try {
    let url = apiUrl.value.trim()
    if (!url) {
      appStore.showError('请输入有效的 API 地址')
      return
    }
    // 统一以 / 结尾，便于拼接
    if (!url.endsWith('/')) url += '/'
    appStore.setApiUrl(url)
    appStore.showSuccess('API 地址已应用')
  } catch (e) {
    appStore.showError('应用失败，请检查地址')
  }
}

const close = () => {
  appStore.hideModal('settingsModal')
}

const handleOverlayClick = () => {
  close()
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-modal {
  max-width: 900px;
  width: 90vw;
  max-height: 85vh;
}

.modal-content {
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  padding: 20px 0;
}

.settings-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-of-type {
  border-bottom: none;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--text-primary);
}

.settings-section h3 {
  font-size: 20px;
  font-weight: 650;
  color: var(--text-primary);
  margin: 0 0 14px 0;
  line-height: 1.4;
}

.api-url-item label { margin-right: 12px; }
.api-url-input { display: flex; gap: 12px; align-items: center; flex: 1; }
.api-url-input input { flex: 1; padding: 10px 12px; border: none; border-radius: 10px; background: var(--neu-bg); box-shadow: var(--neu-shadow-inset); color: var(--text-primary); font-size: 15px; }

.setting-item {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  padding: 14px 0;
}

.setting-item label {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 550;
  min-width: 140px;
  line-height: 1.8;
}

.setting-item select {
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
  color: var(--text-primary);
  font-size: 15px;
  min-width: 180px;
}

.setting-item select:focus {
  outline: none;
  box-shadow: var(--neu-shadow-inset-active);
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  appearance: none;
  border-radius: 4px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.setting-item input[type="checkbox"]:checked {
  background: var(--primary-color);
  box-shadow: var(--neu-shadow);
}

.setting-item input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.download-path {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  max-width: 280px;
}

.download-path input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: var(--neu-bg);
  box-shadow: var(--neu-shadow-inset);
  color: var(--text-primary);
  font-size: 15px;
}

.download-path button {
  padding: 8px 16px;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.settings-actions .neu-button {
  padding: 12px 24px;
}

.settings-actions .neu-button.primary {
  background: var(--primary-color);
  color: white;
}

.settings-actions .neu-button.primary:hover {
  background: var(--primary-color-dark);
}
</style>