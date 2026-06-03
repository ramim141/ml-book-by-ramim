import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import { ProgressProvider } from './context/ProgressContext.jsx'
import { BookmarkProvider } from './context/BookmarkContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <BookmarkProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </BookmarkProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)