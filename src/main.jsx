import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import { ProgressProvider } from './context/ProgressContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)