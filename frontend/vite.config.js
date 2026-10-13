import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Configure Vite for the WriteSpace React application. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/testSetup.js',
    restoreMocks: true,
    clearMocks: true,
  },
});
