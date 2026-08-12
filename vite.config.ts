import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import os from 'node:os'

// Cache dir is kept outside Dropbox: Dropbox's own file-sync locks collide
// with Vite's atomic rename of the dep-optimizer cache (EBUSY on Windows).
export default defineConfig({
  plugins: [react()],
  cacheDir: path.join(os.tmpdir(), 'vite-cache', 'visual-rosary'),
  server: {
    watch: {
      // Static images don't need HMR, and Dropbox's own sync lock on files that
      // are actively being downloaded/written crashes Vite's fs watcher (EBUSY)
      // if it tries to watch them.
      ignored: ['**/public/images/**'],
    },
  },
})
