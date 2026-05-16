import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/ws': { target: 'ws://localhost:8000', ws: true },
      '/demo': 'http://localhost:8000',
      '/episodes': 'http://localhost:8000',
    },
  },
})
