import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // .glb isn't in Vite's default static-asset list, so without this the
  // bundler tries to parse the binary model as JS and the build fails.
  assetsInclude: ['**/*.glb', '**/*.gltf'],
})
