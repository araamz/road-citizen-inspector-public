import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import tanstackRouter from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [".trycloudflare.com"],
    host: "0.0.0.0"
  },
  plugins: [
    // react({
    //   babel: {
    //     plugins: ['babel-plugin-react-compiler']
    //   }
    // })
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  // NOTE: Hidden this because of TypeScript Error
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  // },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
