// Postbuild step: bake the how-to guide's text into the built index.html, inside
// #root, so no-JS crawlers and link-preview scrapers get the full Vietnamese
// content (and first paint is faster). React replaces #root on mount, so the app
// is unaffected. Run via `tsx scripts/inject-guide.ts` after `vite build`.
//
// Fail-soft: any error is logged and the process still exits 0, so a guide problem
// can never break the production build — the content simply isn't prerendered
// (it's still rendered client-side by <HowToGuide>).

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderGuideHtml } from '../src/lib/renderGuideHtml.ts'

function main() {
  const outDir = process.argv[2] ?? 'dist'
  const file = resolve(process.cwd(), outDir, 'index.html')
  const html = readFileSync(file, 'utf-8')
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) {
    console.warn('[inject-guide] root marker not found in', file, '— skipping')
    return
  }
  const injected = html.replace(marker, `<div id="root">${renderGuideHtml('vi')}</div>`)
  writeFileSync(file, injected, 'utf-8')
  console.log('[inject-guide] injected guide HTML into', file)
}

try {
  main()
} catch (err) {
  console.warn('[inject-guide] skipped due to error:', err)
}
