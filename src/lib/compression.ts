export interface CompressionResult {
  compressedDataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatioPercent: number;
  dimensions: { width: number; height: number };
}

/**
 * Compresses retinal fundus photographs on the client side before network transmission.
 * Critical for Rural India Primary Health Centers (PHCs) on 2G/3G cellular networks.
 */
export async function compressRetinalImage(
  fileOrDataUrl: File | string,
  isRuralMode = true
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate scaled dimensions while preserving aspect ratio
      const maxDimension = isRuralMode ? 900 : 1400;
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to create canvas rendering context'));
        return;
      }

      // Smooth bicubic-like scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // High fidelity JPEG compression: 0.78 for rural low-data, 0.90 for standard
      const quality = isRuralMode ? 0.78 : 0.90;
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      // Calculate sizes in KB
      const compressedBytes = Math.round((compressedDataUrl.length * 3) / 4);
      const compressedSizeKb = Math.round(compressedBytes / 1024);

      let originalSizeKb = compressedSizeKb;
      if (fileOrDataUrl instanceof File) {
        originalSizeKb = Math.round(fileOrDataUrl.size / 1024);
      } else {
        const rawBytes = Math.round((fileOrDataUrl.length * 3) / 4);
        originalSizeKb = Math.max(compressedSizeKb, Math.round(rawBytes / 1024));
      }

      const savedPercent = originalSizeKb > compressedSizeKb 
        ? Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)
        : 0;

      resolve({
        compressedDataUrl,
        originalSizeKb,
        compressedSizeKb,
        compressionRatioPercent: savedPercent,
        dimensions: { width, height }
      });
    };

    img.onerror = () => {
      reject(new Error('Invalid or unreadable retinal image format'));
    };

    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error reading image file'));
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
}
