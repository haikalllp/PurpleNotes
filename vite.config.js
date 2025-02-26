import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [ // added to allow any ngrok subdomain
      '.ngrok-free.app',
      '.ngrok.io'
    ],
    cors: true, // Enable CORS
    port: 3500,
    host: 'localhost', // set to true to use network and open the local IP address
    strictPort: true
  }
})