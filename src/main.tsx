import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { themeModeStore } from '@/domain/themeMode'
import { captureShellStyleBaseline } from '@/showcases/styleIsolation'

// Align store + body attrs with FOUC script / localStorage before paint of React tree.
themeModeStore.hydrate()

// Freeze shell styles before any Candidate Library CSS is injected.
captureShellStyleBaseline()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
