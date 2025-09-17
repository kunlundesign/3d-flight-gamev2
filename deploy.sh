#!/bin/bash

echo "🚀 Sky Warriors - 游戏部署脚本"
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"
echo ""

# 检查 dist 目录
if [ ! -d "dist" ]; then
    echo "❌ 错误: dist 目录不存在"
    exit 1
fi

echo "📁 构建文件:"
ls -la dist/
echo ""

# 提供部署选项
echo "🌐 选择部署方式:"
echo "1) 本地预览服务器 (端口 4173)"
echo "2) Python 简单服务器 (端口 8000)"
echo "3) 显示部署文件位置"
echo "4) 退出"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "🚀 启动预览服务器..."
        echo "游戏将在 http://localhost:4173 运行"
        echo "按 Ctrl+C 停止服务器"
        echo ""
        npm run preview
        ;;
    2)
        echo "🐍 启动 Python 服务器..."
        echo "游戏将在 http://localhost:8000 运行"
        echo "按 Ctrl+C 停止服务器"
        echo ""
        cd dist
        python3 -m http.server 8000
        ;;
    3)
        echo "📂 部署文件位置:"
        echo "完整路径: $(pwd)/dist"
        echo ""
        echo "要部署到 Web 服务器，请上传 dist/ 目录中的所有文件"
        echo ""
        echo "推荐部署平台:"
        echo "- Vercel: https://vercel.com"
        echo "- Netlify: https://netlify.com"
        echo "- GitHub Pages: https://pages.github.com"
        ;;
    4)
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

