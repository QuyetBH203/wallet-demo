import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router-dom'
import { Buffer } from 'buffer'

// Polyfill Buffer cho môi trường trình duyệt nếu Vite không tự động làm
interface WindowWithBuffer extends Window {
  Buffer?: typeof Buffer
}

if (typeof window !== 'undefined') {
  ;(window as WindowWithBuffer).Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
