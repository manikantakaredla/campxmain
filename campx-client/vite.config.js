import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://campxserver.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://campxserver.onrender.com',
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
          socket: ['socket.io-client'],
        }
      }
    }
  }
})