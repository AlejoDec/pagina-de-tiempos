const fs = require('fs')
const path = require('path')

// Copy dist/index.html to dist/404.html to allow SPA routing on GitHub Pages
const dist = path.resolve(__dirname, '..', 'dist')
const index = path.join(dist, 'index.html')
const dest = path.join(dist, '404.html')

if (!fs.existsSync(index)) {
  console.error('Build output not found. Run the build before creating 404.html')
  process.exit(1)
}

fs.copyFileSync(index, dest)
console.log('Created dist/404.html for GitHub Pages SPA fallback')
