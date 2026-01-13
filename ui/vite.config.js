/**
 * @file: vite.config.js
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // 【关键】在这里直接设置 host，效果等同于 --host 0.0.0.0
    host: '0.0.0.0',

    // 如果 VPN 导致 WebSocket 连接断开（热更新失效），可以尝试加上这个：
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },

    // 确保 proxy 没有拦截本地 localhost 请求
    // proxy: { ... }
  },
})