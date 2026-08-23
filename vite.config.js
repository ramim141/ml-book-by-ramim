import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 'react-dom/client' আলাদা করে লেখা জরুরি — main.jsx ওই সাবপাথটাই
          // import করে, আর শুধু 'react-dom' লিখলে সেটা মেলে না। ফলে
          // react-dom (~540KB) vendor এ না গিয়ে এন্ট্রি চাঙ্কে ঢুকে পড়ত।
          vendor: ['react', 'react-dom', 'react-dom/client', 'react-router-dom', 'react-helmet-async'],

          // recharts ইচ্ছে করেই বাদ — এটা শুধু অ্যাডমিন ওভারভিউ আর গ্রাফিং
          // টুলে লাগে, অথচ 'ui' চাঙ্কটা প্রতিটি পাতায় preload হয়। সাথে
          // redux-toolkit, immer, d3, decimal.js-light ও টেনে আনত।
          // এখন ওগুলো নিজ নিজ lazy রুটের সাথে যাবে।
          ui: ['framer-motion', 'lucide-react'],

          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          query: ['@tanstack/react-query', '@tanstack/react-query-persist-client', 'idb-keyval']
        }
      }
    }
  }
})
