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
        "description": "SideQuestia is a playful mobile-first web application designed to bring real-life adventures to your friend group. Create and assign side quests to your friends, who can accept them and earn SideQuest Points (SQP) upon completion. It's a fun and engaging way to gamify everyday activities and strengthen social bonds.",
        "icons": [
          {
            "src": "/icons/icon-48x48.png",
            "sizes": "48x48",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-72x72.png",
            "sizes": "72x72",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-96x96.png",
            "sizes": "96x96",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-128x128.png",
            "sizes": "128x128",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-144x144.png",
            "sizes": "144x144",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-152x152.png",
            "sizes": "152x152",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "purpose": "maskable",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-256x256.png",
            "sizes": "256x256",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-384x384.png",
            "sizes": "384x384",
            "purpose": "any",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "purpose": "maskable",
            "type": "image/png"
          }
        ],
        "start_url": "/",
        "display_override": ["fullscreen", "minimal-ui"],
        "display": "standalone",
        "background_color": "#ece3ca",
        "theme_color": "#ece3ca"
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
