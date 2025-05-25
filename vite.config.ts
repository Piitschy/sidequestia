import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "name": "SideQuestia",
        "short_name": "SideQuestia",
        "icons": [
          {
            "src": "/pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/pwa-maskable-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/pwa-maskable-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
        "screenshots": [
          {
            "src": "/screenshots/quests.jpg",
            "sizes": "2400x1080",
            "type": "image/jpeg",
            "label": "Quests Screen",
          },
          {
            "src": "/screenshots/login.jpg",
            "sizes": "2400x1080",
            "type": "image/jpeg",
            "label": "Login Screen",
          },
        ],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#efe8d7",
        "theme_color": "#ece3ca",
        "description": "SideQuestia is a playful mobile-first web application designed to bring real-life adventures to your friend group. Create and assign side quests to your friends, who can accept them and earn SideQuest Points (SQP) upon completion. It's a fun and engaging way to gamify everyday activities and strengthen social bonds."
      },
    })
  ],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/server/**'],
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
