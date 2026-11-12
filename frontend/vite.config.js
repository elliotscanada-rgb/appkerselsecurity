import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'resolved-prude-planner.ngrok-free.dev',
      'localhost',
      '127.0.0.1',
    ]
  }
})
