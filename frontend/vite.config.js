import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
})
