import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
         server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/ollama': {
            target: 'http://localhost:11434',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/ollama/, '/api')
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
      ,
      build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
                if (id.includes('recharts')) return 'vendor_recharts';
                if (id.includes('framer-motion')) return 'vendor_framer';
                if (id.includes('firebase') || id.includes('@firebase')) return 'vendor_firebase';
                if (id.includes('axios')) return 'vendor_axios';
                if (id.includes('lodash') || id.includes('lodash-es')) return 'vendor_lodash';
                if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) return 'vendor_date';
                if (id.includes('chart') || id.includes('d3')) return 'vendor_charts';
                return 'vendor_misc';
              }
            }
          }
        }
      }
    };
});
