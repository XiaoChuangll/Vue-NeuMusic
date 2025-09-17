# Vue NeuMusic

基于 Vue.js 3 的新拟态风格第三方网易云音乐播放器

## ✨ 特性

- 🎵 基于 Vue.js 3 + Composition API 开发
- 🎨 新拟态 (Neumorphism) 设计风格
- 🔐 支持网易云账号登录 (手机/邮箱/二维码)
- 🎧 完整的音乐播放功能
- 📱 响应式设计，支持移动端
- ⚡ Vite 快速热重载开发体验
- 🔄 Pinia 状态管理
- 🌙 支持亮色/暗色主题
- 🎼 音乐发现、搜索、播放列表管理

## 🚀 快速开始

### 前置要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装

```bash
# 进入项目目录
cd NeuMusic

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

或者直接运行启动脚本（Windows）：
```bash
# 双击运行 start.bat
.\start.bat
```

### 开发服务器

启动后访问 [http://localhost:3000](http://localhost:3000)

## 🏗️ 技术栈

- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **加密工具**: crypto-js
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
vue-neumusic/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue 组件
│   │   ├── Navigation.vue  # 导航栏
│   │   ├── Player.vue      # 播放器
│   │   ├── Home.vue        # 首页
│   │   ├── Discover.vue    # 发现页
│   │   ├── Search.vue      # 搜索页
│   │   ├── Me.vue          # 个人中心
│   │   └── Login.vue       # 登录页
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── player.js      # 播放器状态
│   │   └── app.js         # 应用状态
│   ├── services/          # API 服务
│   │   ├── user.js        # 用户相关 API
│   │   ├── music.js       # 音乐相关 API
│   │   └── request.js     # HTTP 请求配置
│   ├── assets/css/        # 样式文件
│   ├── App.vue            # 根组件
│   ├── main.js            # 应用入口
│   └── router.js          # 路由配置
├── package.json
├── vite.config.js
└── README.md
```

## 🎵 功能说明

### 已实现功能

- ✅ **首页展示**: 欢迎页面，热门推荐，用户统计
- ✅ **发现音乐**: 轮播图、推荐歌单、新歌速递、排行榜、歌手分类
- ✅ **用户系统**: 手机/邮箱/二维码登录，用户信息管理
- ✅ **播放器**: 音频播放控制、进度控制、音量控制、播放模式
- ✅ **状态管理**: 用户状态、播放器状态、应用设置持久化
- ✅ **响应式设计**: 适配桌面端和移动端
- ✅ **主题系统**: 支持亮色和暗色主题

### 开发中功能

- 🚧 **搜索功能**: 音乐、歌手、专辑、歌单搜索
- 🚧 **歌单管理**: 创建、编辑、删除歌单
- 🚧 **歌词显示**: 滚动歌词，歌词同步
- 🚧 **评论系统**: 音乐评论查看和发布
- 🚧 **社交功能**: 关注歌手，分享音乐

## 🔧 API 配置

项目依赖网易云音乐 API，需要部署 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)：

```bash
# 克隆 API 项目
git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git
cd NeteaseCloudMusicApi

# 安装依赖
npm install

# 启动 API 服务
npm start
```

API 默认运行在 `http://localhost:3000`，项目中可在设置中修改 API 地址。

## 🎨 设计系统

项目采用新拟态 (Neumorphism) 设计风格：

- **色彩**: 基于柔和的背景色和微妙的阴影
- **阴影**: 使用内外阴影创造浮雕效果
- **圆角**: 统一的圆角半径保持一致性
- **响应**: 鼠标悬停和点击状态的微交互

### CSS 变量

```css
:root {
  --primary-color: #00a1d6;
  --background-color: #f1f1f1;
  --surface-color: #f1f1f1;
  --text-color: #000000;
  --neu-shadow: 0.3vh 0.3vh 1vh #cdcdcd, -0.3vh -0.3vh 1vh #ffffff;
}
```

## 🎮 使用说明

### 游客模式

- 浏览首页推荐内容
- 查看发现页面的音乐分类
- 体验应用界面和设计

### 登录后功能

1. **多种登录方式**：
   - 手机号 + 密码
   - 邮箱 + 密码  
   - 二维码扫码登录

2. **个人音乐管理**：
   - 查看创建的歌单
   - 管理收藏的歌单
   - 查看喜欢的音乐列表

3. **音乐播放**：
   - 播放/暂停控制
   - 上一首/下一首
   - 播放模式切换（顺序/单曲循环/随机）
   - 音量调节
   - 进度控制

## 🔧 开发

### 开发环境启动

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码规范检查

```bash
npm run lint
```

### 预览构建结果

```bash
npm run preview
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) - 网易云音乐 API
- 原版 [NeuMusic](https://github.com/XiaoChuangll/NeuMusic) - 设计灵感来源