import sharp from 'sharp';

// Maximum size for recognition processing is 5MB
const MAX_SIZE = 5 * 1024 * 1024;

export async function resizeImageForRecognition(buffer: Buffer): Promise<Buffer> {
  // Resize to a reasonable size while maintaining aspect ratio
  const resized = await sharp(buffer)
    .resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  return resized;
} 