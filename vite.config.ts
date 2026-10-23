import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets work both at the domain root and in a GitHub Pages project subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
});
