# 🚀 Sky Warriors 游戏部署指南

## 📦 构建完成

项目已成功构建，所有文件位于 `dist/` 目录中：

```
dist/
├── index.html                    # 主页面
├── assets/
│   ├── index-BcW1ps3j.js        # 主游戏逻辑 (122KB)
│   ├── three-C1hlX028.js        # Three.js 库 (581KB)
│   ├── plane-Bi0ukfrs.png       # 飞机纹理 (216KB)
│   └── background-video-CWhOimxN.mp4  # 背景视频 (6.2MB)
└── vite.svg                     # Vite 图标
```

## 🌐 部署选项

### 1. 本地部署 (推荐用于测试)

```bash
# 启动预览服务器
npm run preview

# 游戏将在 http://localhost:4173 运行
```

### 2. 静态文件服务器部署

#### 使用 Python (简单)
```bash
cd dist
python -m http.server 8000
# 访问 http://localhost:8000
```

#### 使用 Node.js serve
```bash
npm install -g serve
serve -s dist -l 3000
# 访问 http://localhost:3000
```

### 3. 云平台部署

#### Vercel (推荐)
1. 安装 Vercel CLI: `npm i -g vercel`
2. 在项目根目录运行: `vercel --prod`
3. 将 `dist` 目录设为输出目录

#### Netlify
1. 将 `dist` 目录拖拽到 Netlify 部署区域
2. 或连接 GitHub 仓库自动部署

#### GitHub Pages
1. 将 `dist` 目录内容推送到 `gh-pages` 分支
2. 在仓库设置中启用 GitHub Pages

### 4. 传统 Web 服务器

#### Apache
```apache
# .htaccess 文件
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## ⚡ 性能优化

### 已实现的优化
- ✅ 代码分割 (Three.js 独立打包)
- ✅ 资源压缩 (ESBuild 压缩)
- ✅ 静态资源优化
- ✅ Source Map 生成 (便于调试)

### 进一步优化建议
1. **CDN 加速**: 将 Three.js 等大型库托管到 CDN
2. **图片优化**: 使用 WebP 格式减少文件大小
3. **视频压缩**: 优化背景视频文件大小
4. **预加载**: 添加关键资源预加载

## 🔧 环境要求

### 最低要求
- 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)
- WebGL 支持
- 2GB RAM (推荐 4GB+)
- 稳定的网络连接

### 推荐配置
- Chrome/Edge 最新版本
- 4GB+ RAM
- 独立显卡
- 高速网络连接

## 📱 移动端支持

游戏已优化移动端体验：
- 触摸控制支持
- 响应式 UI 设计
- 移动端性能优化
- 自适应屏幕尺寸

## 🛠️ 故障排除

### 常见问题

1. **游戏无法加载**
   - 检查浏览器控制台错误
   - 确认 WebGL 支持
   - 检查网络连接

2. **性能问题**
   - 降低浏览器设置
   - 关闭其他标签页
   - 检查系统资源使用

3. **资源加载失败**
   - 检查文件路径
   - 确认服务器配置
   - 检查 CORS 设置

## 📊 构建统计

- **总文件大小**: ~7.2MB
- **主 JS 文件**: 122KB (压缩后 36KB)
- **Three.js 库**: 581KB (压缩后 148KB)
- **资源文件**: 6.4MB (主要是视频)

## 🎮 游戏特性

- 3D 飞行模拟
- 实时战斗系统
- 程序化地形生成
- 多平台控制支持
- 现代 Web 技术栈

## 📞 技术支持

如有部署问题，请检查：
1. 浏览器控制台错误信息
2. 网络连接状态
3. 服务器配置正确性
4. 文件权限设置

---

**部署成功！** 🎉 您的 Sky Warriors 3D 飞行游戏已准备就绪！

