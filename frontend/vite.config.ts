import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Allow requests to HTTPS backend with self-signed certificates
    proxy: {
      // No proxy needed - using direct HTTPS calls
    },
  },
})

