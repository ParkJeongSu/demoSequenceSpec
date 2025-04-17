import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 🔥 file:// 경로에서 상대경로로 불러오기 위해 꼭 필요!
  build: {
    outDir: 'dist' // 👉 기본값이라 생략해도 되지만 명시적으로 써도 OK
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
