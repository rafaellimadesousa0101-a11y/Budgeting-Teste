import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';

function avatarAssetPlugin(): Plugin {
  return {
    name: 'avatar-asset-saver',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save-avatar' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { slotId, dataUrl, filename } = JSON.parse(body);
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const name = filename || `avatar-${slotId}.webp`;

              const srcAssetsDir = path.resolve(__dirname, 'src/assets/avatars');
              const publicAssetsDir = path.resolve(__dirname, 'public/avatars');
              fs.mkdirSync(srcAssetsDir, { recursive: true });
              fs.mkdirSync(publicAssetsDir, { recursive: true });

              fs.writeFileSync(path.join(srcAssetsDir, name), buffer);
              fs.writeFileSync(path.join(publicAssetsDir, name), buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  name,
                  srcPath: `src/assets/avatars/${name}`,
                  url: `/avatars/${name}`,
                  size: buffer.length,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/delete-avatar' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { filename } = JSON.parse(body);
              const srcAssetsDir = path.resolve(__dirname, 'src/assets/avatars');
              const publicAssetsDir = path.resolve(__dirname, 'public/avatars');

              const srcFile = path.join(srcAssetsDir, filename);
              const publicFile = path.join(publicAssetsDir, filename);

              if (fs.existsSync(srcFile)) fs.unlinkSync(srcFile);
              if (fs.existsSync(publicFile)) fs.unlinkSync(publicFile);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/list-avatars' && req.method === 'GET') {
          try {
            const publicAssetsDir = path.resolve(__dirname, 'public/avatars');
            if (fs.existsSync(publicAssetsDir)) {
              const files = fs.readdirSync(publicAssetsDir).filter((f) => f.endsWith('.webp'));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ files }));
              return;
            }
          } catch {}
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ files: [] }));
          return;
        }

        if (req.url === '/api/ai/financial-assistant' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { processFinancialAiQuestion } = await import('./src/server/financialAi.ts');
              const parsed = JSON.parse(body);
              const result = await processFinancialAiQuestion(parsed, req.headers as any);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), avatarAssetPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      assetsInlineLimit: 20480, // Garante que todos os assets locais de até 20KB sejam embutidos diretamente no bundle
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
