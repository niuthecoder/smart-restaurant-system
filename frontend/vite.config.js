import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-icons': ['react-icons'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
  },
})
