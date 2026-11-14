import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mockApiPlugin } from './mock/mockApiPlugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useMockApi = env.VITE_USE_MOCK_API === 'true';

  return {
    plugins: [react(), ...(useMockApi ? [mockApiPlugin()] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Bind every interface so the app is reachable through a reverse proxy
      // / sandbox preview host, not just from inside the container.
      host: '0.0.0.0',
      port: Number(env.PORT) || 5173,
      strictPort: false,
      // The preview is served from a generated hostname; accept it explicitly
      // rather than disabling the host check outright.
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
        : true,
      hmr: { clientPort: 443, protocol: 'wss' },
      // Only proxy to the real Node API when the mock is switched off.
      proxy: useMockApi
        ? undefined
        : {
            '/api': {
              target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
              changeOrigin: true,
            },
          },
    },
    preview: {
      host: '0.0.0.0',
      port: Number(env.PORT) || 4173,
      allowedHosts: true,
    },
    build: {
      outDir: 'dist',
      // Full source maps leak application logic; keep them out of prod builds
      // and generate them only for CI/staging via BUILD_SOURCEMAP=true.
      sourcemap: env.BUILD_SOURCEMAP === 'true' ? 'hidden' : false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
            state: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
            data: ['@tanstack/react-query', 'axios'],
            charts: ['recharts'],
          },
        },
      },
    },
  };
});
