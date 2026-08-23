import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import { ProgressProvider } from './context/ProgressContext.jsx'
import { BookmarkProvider } from './context/BookmarkContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'

// Disable console.log, info, warn globally to prevent data printing in console
if (import.meta.env.PROD || true) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// Create an IndexedDB storage persister for massive caching
const idbStorage = {
  getItem: async (key) => {
    const val = await get(key);
    if (val === '[object Promise]') {
      await del(key);
      return undefined;
    }
    return val;
  },
  setItem: async (key, value) => await set(key, value),
  removeItem: async (key) => await del(key),
};

const persister = createAsyncStoragePersister({
  storage: idbStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (reasonable caching)
      gcTime: 1000 * 60 * 60 * 24 * 7, // Garbage collect after 7 days
      refetchOnWindowFocus: false, // Don't refetch automatically when switching tabs
    },
  },
});

// অ্যাপের খোলস ক্যাশ করে রাখি, যাতে দুর্বল সংযোগেও পাতা খোলে।
// শুধু প্রোডাকশনে — ডেভে থাকলে HMR এর সাথে দ্বন্দ্ব বাধত।
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // রেজিস্ট্রেশন ব্যর্থ হলে অ্যাপ আগের মতোই চলবে, শুধু অফলাইন সুবিধা থাকবে না
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <BookmarkProvider>
              <ProgressProvider>
                <App />
              </ProgressProvider>
            </BookmarkProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
)