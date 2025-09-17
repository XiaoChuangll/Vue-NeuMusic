@echo off
echo ========================================
echo     Vue NeuMusic 快速启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否已安装
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    echo.
    echo 请先安装 Node.js:
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

REM 显示 Node.js 版本
echo ✅ Node.js 已安装
node --version
echo.

REM 检查 npm 是否可用
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ 错误: npm 不可用
    pause
    exit /b 1
)

echo ✅ npm 已就绪
npm --version
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误: 当前目录不是 Vue NeuMusic 项目根目录
    echo 请确保在 vue-neumusic 文件夹中运行此脚本
    pause
    exit /b 1
)

echo 📦 安装项目依赖...
npm install

if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成！
echo.
echo 🚀 启动开发服务器...
echo.
echo 服务器将在 http://localhost:3000 启动
echo 按 Ctrl+C 可以停止服务器
echo.

npm run dev

pause