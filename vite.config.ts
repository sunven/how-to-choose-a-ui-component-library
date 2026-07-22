import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue(), react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      // Semi's package exports omit dist/css; alias so Vite can resolve the global stylesheet.
      '@douyinfe/semi-ui/dist/css/semi.min.css': path.resolve(
        rootDir,
        'node_modules/@douyinfe/semi-ui/dist/css/semi.min.css',
      ),
    },
  },
})
