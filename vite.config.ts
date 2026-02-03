import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

const version = packageJson.version
const buildDate = new Date().toISOString()
const banner = `/*! Build: ${version} - ${buildDate} */`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'css-banner',
      apply: 'build',
      generateBundle(options, bundle) {
        for (const fileName in bundle) {
          if (fileName.endsWith('.css')) {
            const chunk = bundle[fileName]
            if (chunk.type === 'asset' && typeof chunk.source === 'string') {
              chunk.source = `${banner}\n${chunk.source}`
            }
          }
        }
      }
    }
  ],
  build: {
    outDir: 'public/build',
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        banner: banner
      }
    }
  }
})
