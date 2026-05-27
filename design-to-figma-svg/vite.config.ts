import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 从 v0 环境变量文件加载
function loadV0Env() {
  const envPath = '/vercel/share/.env.project';
  const envVars: Record<string, string> = {};
  
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  } catch (e) {
    console.error('Failed to load env:', e);
  }
  
  return envVars;
}

export default defineConfig(() => {
    const env = loadV0Env();
    console.log('[v0] VITE_API_KEY loaded:', !!env.VITE_API_KEY);
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
