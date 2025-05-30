import sharp from 'sharp';

// Maximum size for AWS Rekognition is 5MB (5,242,880 bytes)
const MAX_SIZE = 5 * 1024 * 1024;

export async function resizeImageForRekognition(buffer: Buffer): Promise<Buffer> {
  // AWS Rekognition has specific requirements for input images
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