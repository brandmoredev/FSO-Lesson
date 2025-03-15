import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const targetLocation = process.env === 'production' ? "https://fso-notes-clj8.onrender.com" : 'http://localhost:3002'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: targetLocation,
        changeOrigin: true
      }
    }
  }
})
