/**
 * Utilitário para processamento de imagens de avatar:
 * - Verificação de imagens sem fundo (canal alpha/transparência)
 * - Aproximação automática do rosto do avatar para ocupar todo o espaço circular disponível
 * - Redimensionamento e redução de resolução para 256x256 px
 * - Conversão para WebP com compressão agressiva (qualidade 0.65)
 * - Salvamento nos diretórios de recursos locais (Assets): /src/assets/avatars/ e /public/avatars/
 */

export interface ProcessedAvatarResult {
  dataUrl: string;
  sizeBytes: number;
  sizeKb: string;
  slotId: string;
  filename: string;
  savedToAssets: boolean;
  hasNoBackground: boolean;
  publicUrl?: string;
}

/**
 * Detecta se a imagem possui fundo transparente ("não possui fundo")
 * e calcula a caixa delimitadora (bounding box) dos pixels visíveis do personagem/rosto.
 */
function detectTransparencyAndBounds(
  img: HTMLImageElement,
  origW: number,
  origH: number
): {
  hasNoBackground: boolean;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  contentW: number;
  contentH: number;
} {
  // Amostra a imagem em resolução otimizada para análise rápida e precisa de pixels
  const maxScanDim = 600;
  const scale = Math.min(1, maxScanDim / Math.max(origW, origH));
  const scanW = Math.max(1, Math.round(origW * scale));
  const scanH = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = scanW;
  canvas.height = scanH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      hasNoBackground: false,
      minX: 0,
      minY: 0,
      maxX: origW,
      maxY: origH,
      contentW: origW,
      contentH: origH,
    };
  }

  ctx.drawImage(img, 0, 0, scanW, scanH);
  const imgData = ctx.getImageData(0, 0, scanW, scanH);
  const data = imgData.data;

  let transparentPixelsCount = 0;
  let borderTransparentCount = 0;
  let totalBorderPixels = 0;

  let minX = scanW;
  let minY = scanH;
  let maxX = -1;
  let maxY = -1;

  // Limiar de transparência: pixels com alpha <= 35 são considerados fundo transparente
  const alphaThreshold = 35;

  for (let y = 0; y < scanH; y++) {
    const isBorderY = y === 0 || y === scanH - 1;
    for (let x = 0; x < scanW; x++) {
      const idx = (y * scanW + x) * 4;
      const alpha = data[idx + 3];
      const isBorder = isBorderY || x === 0 || x === scanW - 1;

      if (isBorder) {
        totalBorderPixels++;
        if (alpha <= alphaThreshold) {
          borderTransparentCount++;
        }
      }

      if (alpha <= alphaThreshold) {
        transparentPixelsCount++;
      } else {
        // Pixel com conteúdo (não transparente)
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const totalPixels = scanW * scanH;
  const transparentRatio = transparentPixelsCount / totalPixels;
  const borderTransparentRatio = borderTransparentCount / (totalBorderPixels || 1);

  // A imagem não possui fundo se as bordas ou a maior parte do entorno tiver transparência
  const hasNoBackground =
    borderTransparentRatio > 0.08 ||
    (transparentRatio > 0.03 && borderTransparentCount > 4);

  if (!hasNoBackground || maxX < minX || maxY < minY) {
    return {
      hasNoBackground: false,
      minX: 0,
      minY: 0,
      maxX: origW,
      maxY: origH,
      contentW: origW,
      contentH: origH,
    };
  }

  // Mapeia as coordenadas escaneadas de volta para a resolução original
  const origMinX = Math.floor(minX / scale);
  const origMinY = Math.floor(minY / scale);
  const origMaxX = Math.ceil(maxX / scale);
  const origMaxY = Math.ceil(maxY / scale);

  return {
    hasNoBackground: true,
    minX: Math.max(0, origMinX),
    minY: Math.max(0, origMinY),
    maxX: Math.min(origW - 1, origMaxX),
    maxY: Math.min(origH - 1, origMaxY),
    contentW: Math.min(origW, origMaxX - origMinX + 1),
    contentH: Math.min(origH, origMaxY - origMinY + 1),
  };
}

export async function processAndSaveAvatar(
  file: File,
  slotId: string
): Promise<ProcessedAvatarResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Erro ao ler a imagem do computador.'));
    };

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Não foi possível carregar a imagem selecionada.'));
      };

      img.onload = async () => {
        try {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          // 1. Verifica se a imagem não possui fundo (fundo transparente)
          const bounds = detectTransparencyAndBounds(img, origW, origH);

          // 2. Calcula as coordenadas de recorte e aproximação
          let srcX: number;
          let srcY: number;
          let srcW: number;
          let srcH: number;

          if (bounds.hasNoBackground) {
            // Caso NÃO tenha fundo: aproxima o rosto do avatar para ocupar todo o espaço disponível
            const { minX, minY, contentW, contentH } = bounds;
            const contentCenterX = minX + contentW / 2;

            if (contentH > contentW * 1.25) {
              // Personagem de corpo inteiro ou 3/4: o rosto está no topo
              // Tamanho focado na cabeça e rosto com zoom generoso
              const faceSize = contentW * 0.90;
              srcW = faceSize;
              srcH = faceSize;
              srcX = contentCenterX - srcW / 2;
              // Alinha o topo da cabeça bem próximo da borda superior para zoom máximo no rosto
              srcY = minY + faceSize * 0.05;
            } else if (contentH > contentW * 1.05) {
              // Busto ou meio corpo: aproxima no rosto/cabeça
              const faceSize = contentW * 0.88;
              srcW = faceSize;
              srcH = faceSize;
              srcX = contentCenterX - srcW / 2;
              srcY = minY + faceSize * 0.04;
            } else {
              // Já é um avatar de rosto/cabeça ou quadrado:
              // Remove todo o espaço transparente ao redor e aproxima para ocupar o círculo completo
              const faceSize = Math.min(contentW, contentH) * 0.95;
              const cropSize = Math.max(faceSize, Math.min(contentW, contentH));
              srcW = cropSize;
              srcH = cropSize;
              srcX = contentCenterX - srcW / 2;
              srcY = minY + contentH / 2 - srcH / 2;
            }

            // Garante que o quadrado de recorte fique dentro dos limites da imagem
            if (srcX < 0) srcX = 0;
            if (srcY < 0) srcY = 0;
            if (srcX + srcW > origW) srcX = Math.max(0, origW - srcW);
            if (srcY + srcH > origH) srcY = Math.max(0, origH - srcH);
            srcW = Math.min(srcW, origW - srcX);
            srcH = Math.min(srcH, origH - srcY);
            // Mantém rigorosamente quadrado
            const squareDim = Math.min(srcW, srcH);
            srcW = squareDim;
            srcH = squareDim;
          } else {
            // Imagem com fundo sólido padrão: recorte centralizado proporcional clássico (cover)
            const minDim = Math.min(origW, origH);
            srcW = minDim;
            srcH = minDim;
            srcX = (origW - minDim) / 2;
            srcY = (origH - minDim) / 2;
          }

          // 3. Renderização no Canvas de destino (256x256 px)
          const targetSize = 256;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Contexto de renderização 2D não disponível.'));
            return;
          }

          // Ativa suavização de alta fidelidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            srcX,
            srcY,
            srcW,
            srcH,
            0,
            0,
            targetSize,
            targetSize
          );

          // 4. Compressão agressiva em formato WebP mantendo nitidez impecável
          let webpDataUrl = canvas.toDataURL('image/webp', 0.65);

          // Fallback caso o ambiente não suporte toDataURL com webp
          if (!webpDataUrl.startsWith('data:image/webp')) {
            webpDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          }

          // Calcula tamanho em bytes a partir da string base64
          const base64Content = webpDataUrl.split(',')[1] || '';
          const sizeBytes = Math.round((base64Content.length * 3) / 4);
          const sizeKb = (sizeBytes / 1024).toFixed(1);

          const filename = `avatar-${slotId}.webp`;
          let savedToAssets = false;
          let publicUrl = `/avatars/${filename}`;

          // 5. Salva no backend na pasta de recursos locais (Assets)
          try {
            const response = await fetch('/api/save-avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                slotId,
                filename,
                dataUrl: webpDataUrl,
              }),
            });

            if (response.ok) {
              const resData = await response.json();
              if (resData.success) {
                savedToAssets = true;
                if (resData.url) {
                  publicUrl = resData.url;
                }
              }
            }
          } catch (e) {
            console.warn('Salvamento no endpoint local falhou (modo cliente):', e);
          }

          resolve({
            dataUrl: webpDataUrl,
            sizeBytes,
            sizeKb,
            slotId,
            filename,
            savedToAssets,
            hasNoBackground: bounds.hasNoBackground,
            publicUrl,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Remove avatar localmente e do backend (Assets)
 */
export async function deleteAvatarFromAssets(slotId: string): Promise<void> {
  const filename = `avatar-${slotId}.webp`;
  try {
    await fetch('/api/delete-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
  } catch (e) {
    console.warn('Erro ao deletar avatar da pasta de assets:', e);
  }
}
