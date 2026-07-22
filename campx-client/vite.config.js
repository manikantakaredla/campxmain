import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512.png'
      ],

      manifest: {
        id: '/',
        name: 'CAMPX Platform',
        short_name: 'CAMPX',
        description: 'Comprehensive Campus Management System',

        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#2563eb',
        background_color: '#ffffff',

        categories: [
          'education',
          'productivity'
        ],

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1440x900',
            type: 'image/png',
            form_factor: 'wide',
            label: 'CAMPX Desktop Dashboard'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            label: 'CAMPX Mobile Dashboard'
          }
        ]
      },



      devOptions: {
        enabled: true
      }
    })
  ],

  server: {
    port: 5173,

    proxy: {
      '/api': {
        target: 'https://campxserver.onrender.com',
        changeOrigin: true
      },

      '/socket.io': {
        target: 'https://campxserver.onrender.com',
        ws: true,
        changeOrigin: true
      }
    }
  },

  build: {
    target: 'esnext',

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom'
          ],

          icons: [
            'lucide-react'
          ],

          socket: [
            'socket.io-client'
          ]
        }
      }
    }
  }
})