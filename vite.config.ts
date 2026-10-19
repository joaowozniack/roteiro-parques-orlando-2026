import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Actions supplies the repository name. Locally, use VITE_BASE_PATH=/repo/ to test.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS === 'true' && repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/')

export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.svg', 'icons/*.png', 'island.svg'],
    manifest: {
      name: 'Minha Viagem Orlando 2026', short_name: 'Orlando 2026',
      description: 'Seu guia de bolso para dias inesquecíveis nos parques.',
      lang: 'pt-BR', theme_color: '#0b1423', background_color: '#0b1423',
      display: 'standalone', start_url: base, scope: base,
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      navigateFallback: `${base}index.html`,
      cleanupOutdatedCaches: true,
    },
  })],
})
