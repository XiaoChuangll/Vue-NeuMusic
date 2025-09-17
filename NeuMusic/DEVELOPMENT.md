# Vue NeuMusic 开发和运行指南

## 前置要求

请确保您的系统已安装以下软件：

1. **Node.js** (版本 16.0 或更高)
   - 下载地址：https://nodejs.org/
   - 推荐安装 LTS 版本

2. **npm** (随 Node.js 一起安装)
   - 或者使用 **yarn** 或 **pnpm** 作为替代

## 快速开始

### 1. 安装依赖

```bash
cd NeuMusic
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动

### 3. 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构说明

```
NeuMusic/
├── public/                 # 静态资源
│   └── icon.ico           # 网站图标
├── src/
│   ├── components/         # Vue 组件
│   │   ├── Navigation.vue  # 导航栏
│   │   ├── Player.vue      # 播放器
│   │   ├── Home.vue        # 首页
│   │   ├── Discover.vue    # 发现页
│   │   ├── Search.vue      # 搜索页
│   │   ├── Me.vue          # 个人中心
│   │   ├── Login.vue       # 登录页
│   │   └── ...            # 其他组件
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── player.js      # 播放器状态
│   │   ├── app.js         # 应用状态
│   │   └── index.js       # Store 入口
│   ├── services/          # API 服务
│   │   ├── request.js     # HTTP 客户端
│   │   ├── user.js        # 用户 API
│   │   ├── music.js       # 音乐 API
│   │   └── index.js       # 服务入口
│   ├── assets/            # 资源文件
│   │   └── css/           # 样式文件
│   │       ├── variables.css    # CSS 变量
│   │       ├── main.css         # 主样式
│   │       ├── navigation.css   # 导航样式
│   │       └── player.css       # 播放器样式
│   ├── App.vue            # 根组件
│   ├── main.js            # 应用入口
│   └── router.js          # 路由配置
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 功能特性

### ✅ 已实现
- 🎨 新拟态 (Neumorphism) 设计风格
- 🔧 Vue.js 3 + Vite 开发环境
- 📱 响应式设计
- 🔄 Vue Router 路由管理
- 📦 Pinia 状态管理
- 🎵 音频播放基础架构
- 🔐 用户登录界面
- 🏠 基础页面结构

### 🚧 开发中
- 🎵 音乐播放功能
- 🔍 搜索功能
- 📋 歌单管理
- 👤 用户个人中心
- 🎨 主题切换
- 📱 移动端优化

## API 配置

### 网易云音乐 API

这个项目需要配合网易云音乐 API 使用。请按照以下步骤设置：

1. 克隆并部署 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

```bash
git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git
cd NeteaseCloudMusicApi
npm install
npm start
```

2. API 服务默认运行在 `http://localhost:3000`

3. 在 Vue NeuMusic 中，默认 API 地址为 `http://139.9.223.233:3000/`，您可以在代码中修改为本地地址

## 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范化：

```bash
# 检查代码规范
npm run lint

# 自动格式化代码
npm run lint --fix
```

### 样式开发

- 使用 CSS 变量管理主题色彩
- 遵循 BEM 命名规范
- 优先使用 Flexbox 和 Grid 布局
- 确保响应式设计兼容性

### 组件开发

- 使用 Vue 3 Composition API
- 合理拆分组件粒度
- 使用 Pinia 管理全局状态
- 确保组件的可复用性

## 故障排除

### 常见问题

1. **Node.js 版本过低**
   - 请升级到 Node.js 16.0 或更高版本

2. **依赖安装失败**
   - 删除 `node_modules` 和 `package-lock.json`
   - 重新运行 `npm install`

3. **开发服务器启动失败**
   - 检查端口 3000 是否被占用
   - 尝试修改 `vite.config.js` 中的端口设置

4. **API 请求失败**
   - 确保网易云音乐 API 服务正在运行
   - 检查 API 地址配置是否正确

## 贡献指南

欢迎贡献代码！请按照以下步骤：

1. Fork 这个项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) - 网易云音乐 API
- 原版 [NeuMusic](https://github.com/XiaoChuangll/NeuMusic) 项目提供设计灵感