import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Vercel serves the same static index.html for production, preview, and local
// builds, so this flips the page to noindex whenever VERCEL_ENV isn't
// "production" (which `vercel build --prod` sets during the real deploy).
function robotsMetaPlugin() {
  const isProduction = process.env.VERCEL_ENV === 'production'
  return {
    name: 'robots-meta',
    transformIndexHtml(html) {
      if (isProduction) return html
      return html.replace(
        '<meta name="robots" content="index, follow" />',
        '<meta name="robots" content="noindex, nofollow" />'
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), robotsMetaPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**', 'shared/**', 'api/**'],
      exclude: ['src/main.jsx', 'src/main.tsx', 'src/test/**'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
