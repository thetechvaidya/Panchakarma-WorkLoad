import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react({ jsxRuntime: 'automatic' }),
      tailwindcss()
    ],
    
    server: {
      host: 'localhost',
      port: 5002,
      hmr: {
        port: 5003,
        overlay: false
      },
      open: true,
      strictPort: false,
      cors: true,
      fs: {
        strict: false
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    },
    
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: !isDev,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: isDev
    },
    
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
        '@/components': path.resolve(import.meta.dirname, './components'),
        '@/services': path.resolve(import.meta.dirname, './services'),
        '@/types': path.resolve(import.meta.dirname, './types')
      }
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };
});
