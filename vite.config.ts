import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': {}, // Polyfill process.env to prevent "process is not defined" error
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      'process.env.NEON_DATABASE_URL': JSON.stringify(env.NEON_DATABASE_URL)
    }
  }
})
