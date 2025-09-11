import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: isDev,
        // JSX runtime
        jsxRuntime: 'automatic'
      })
    ],
    
    server: {
      host: '0.0.0.0',
      port: 5002,
      hmr: true,
      open: true
    },
    
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: !isDev,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js']
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
      include: ['react', 'react-dom', '@supabase/supabase-js']
    },
    
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };
});
