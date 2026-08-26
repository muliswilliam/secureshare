import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.next/**'],
    env: {
      STORAGE_BUCKET_NAME: 'test-bucket',
      STORAGE_PUBLIC_URL: 'https://cdn.example.com/test-bucket'
    }
  }
})
