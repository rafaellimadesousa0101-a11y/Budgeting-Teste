/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { processFinancialAiQuestion } from './src/server/financialAi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// AI Financial Assistant endpoint with App Check and Rate Limiting
app.post('/api/ai/financial-assistant', async (req, res) => {
  const result = await processFinancialAiQuestion(req.body, req.headers as any);
  res.status(result.status).json(result);
});

// Avatar API endpoints
app.post('/api/save-avatar', (req, res) => {
  try {
    const { slotId, dataUrl, filename } = req.body;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const name = filename || `avatar-${slotId}.webp`;

    const publicAssetsDir = path.resolve(__dirname, 'public/avatars');
    const distAssetsDir = path.resolve(__dirname, 'dist/avatars');
    fs.mkdirSync(publicAssetsDir, { recursive: true });
    if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
      fs.writeFileSync(path.join(distAssetsDir, name), buffer);
    }

    fs.writeFileSync(path.join(publicAssetsDir, name), buffer);

    res.json({
      success: true,
      name,
      url: `/avatars/${name}`,
      size: buffer.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

app.post('/api/delete-avatar', (req, res) => {
  try {
    const { filename } = req.body;
    const publicFile = path.join(path.resolve(__dirname, 'public/avatars'), filename);
    const distFile = path.join(path.resolve(__dirname, 'dist/avatars'), filename);

    if (fs.existsSync(publicFile)) fs.unlinkSync(publicFile);
    if (fs.existsSync(distFile)) fs.unlinkSync(distFile);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

app.get('/api/list-avatars', (_req, res) => {
  try {
    const publicAssetsDir = path.resolve(__dirname, 'public/avatars');
    if (fs.existsSync(publicAssetsDir)) {
      const files = fs.readdirSync(publicAssetsDir).filter((f) => f.endsWith('.webp'));
      res.json({ files });
      return;
    }
  } catch {}
  res.json({ files: [] });
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static frontend from dist
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.send('Frontend build not ready. Please run npm run build.');
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});
