import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // When deploying to GitHub Pages under a repo (project page), set base to '/<repo-name>/'
  // Replace 'pagina-de-tiempos' if you will deploy to a different repository name.
  base: '/pagina-de-tiempos/',
  plugins: [react()],
})
