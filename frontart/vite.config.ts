import { defineConfig } from 'vite'
import path from 'path'
import fs from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const backendEnvPath = path.resolve(__dirname, '../backend/.env')

const getBackendPort = () => {
  try {
    const envFile = fs.readFileSync(backendEnvPath, 'utf8')
    const portLine = envFile
      .split(/\r?\n/)
      .find((line) => line.trim().startsWith('PORT='))

    if (!portLine) return '5000'
    const portValue = portLine.split('=')[1]?.trim()
    return portValue || '5000'
  } catch {
    return '5000'
  }
}

const backendTarget = `http://localhost:${getBackendPort()}`

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
