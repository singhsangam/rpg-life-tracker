import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  // Local: / ; GitHub Pages project site needs repo base path
  base: command === 'serve' ? '/' : '/rpg-life-tracker/',
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        navigateFallback: 'index.html',
        // Prefer fresh HTML/JS so phone/laptop pick up sync builds quickly
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.mode === 'navigate' ||
              request.destination === 'document' ||
              request.destination === 'script',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rpg-life-pages',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      manifest: {
        name: 'RPG Life Tracker',
        short_name: 'LifeRPG',
        description: 'Gamified daily routine & habit tracker',
        theme_color: '#05070c',
        background_color: '#05070c',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
}))
