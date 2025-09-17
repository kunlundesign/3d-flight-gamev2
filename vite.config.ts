/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite'

/**
 * Vite 配置文件
 * 用于优化 Sky Warriors 3D 飞行游戏的构建和部署
 */
// Use a function form to access mode/env so we can set base dynamically
export default defineConfig(({ mode }) => {
  // Load env variables if needed (e.g., GITHUB_PAGES=true)
  const env = loadEnv(mode, process.cwd(), '');
  // If deploying to GitHub Pages under repo name (e.g., https://username.github.io/3d-flight-gamev2/)
  // set BASE to '/3d-flight-gamev2/' or allow override via process env BASE_PATH
  const repoBase = '/3d-flight-gamev2/';
  const base = env.BASE_PATH || (env.GITHUB_PAGES === 'true' ? repoBase : '/');
  console.log('[Vite config] mode=', mode, ' base=', base);
  return {
    base,
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成 source map 用于调试
    sourcemap: true,
    // 资源内联阈值 (4KB)
    assetsInlineLimit: 4096,
    // 压缩选项
    minify: 'esbuild',
    // 分块策略
    rollupOptions: {
      output: {
        // 手动分块
        manualChunks: {
          // Three.js 相关库
          'three': ['three'],
          // 游戏核心系统
          'core': [
            './src/core/SceneManager.ts',
            './src/core/InputHandler.ts', 
            './src/core/PlanetTerrain.ts'
          ],
          // 游戏对象
          'game': [
            './src/game/Player.ts',
            './src/game/Tank.ts',
            './src/game/WeaponSystem.ts',
            './src/game/HomeScene.ts',
            './src/game/PlayScene.ts'
          ]
        }
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    host: true, // 允许外部访问
    open: true  // 自动打开浏览器
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  
  // 资源处理
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.mp4'],
  
  // 优化配置
  optimizeDeps: {
    include: ['three']
  }
}
})
