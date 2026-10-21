import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const localServerPort = env.LOCAL_SERVER_PORT || '13305';
    const localServerTarget = env.LOCAL_SERVER_URL || `http://127.0.0.1:${localServerPort}`;
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/local-server': {
            target: localServerTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (p) => p.replace(/^\/api\/local-server/, ''),
          }
        }
      },
      define: {
        'process.env.DEFAULT_SERVER_URL': JSON.stringify(`http://localhost:${localServerPort}`),
        'process.env.LOCAL_SERVER_PORT': JSON.stringify(localServerPort)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

