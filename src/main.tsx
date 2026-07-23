import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { captureShellStyleBaseline } from '@/showcases/styleIsolation'

// Freeze shell styles before any Candidate Library CSS is injected.
captureShellStyleBaseline()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
