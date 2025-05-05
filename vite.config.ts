import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Info Risques Baignade',
        short_name: 'IRB',
        start_url: '/infoRisquesBaignade',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/img/faviconI_192x192',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/faviconI_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/infoRisquesBaignade/',

})
