import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Service worker registration is intentionally REMOVED for now. A previous SW cached
// the app shell and, after several deploys, left some devices serving a stale page
// that pointed at a deleted CSS file (unstyled page). public/sw.js is now a kill-switch
// that clears its Cache Storage and unregisters itself; not re-registering here lets the
// site settle to a clean, network-only state. (Re-add a correct, versioned SW later if
// we want offline/PWA support again.)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((reg) => reg.update().catch(() => {}))
  }).catch(() => {})
}
