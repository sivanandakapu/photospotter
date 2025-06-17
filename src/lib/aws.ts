import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// AWS Rekognition has been removed in favor of the InsightFace library.
// The S3 client is still used for photo storage.

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET_ORIGINALS!;
// Collection id is no longer required when using InsightFace but kept for
// backward compatibility of environment files.
const CDN_DOMAIN = process.env.CDN_DOMAIN!;

export async function uploadToS3(buffer: Buffer, contentType: string): Promise<string> {
  const key = `${Date.now()}-${Math.random().toString(36).substring(2)}.${contentType.split('/')[1]}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_ORIGINALS,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `https://${process.env.CDN_DOMAIN}/${key}`;
}

// The following helper functions now delegate to the InsightFace-based
// implementation located in `src/lib/insightface.ts`.
import {
  indexFace,
  searchFacesByImage,
  searchFaces,
  deleteAllFacesFromCollection
} from './insightface';

export { indexFace, searchFacesByImage, searchFaces, deleteAllFacesFromCollection };

export async function indexFaceInRekognition(buffer: Buffer, externalImageId?: string): Promise<string> {
  // Deprecated function maintained for backward compatibility.
  return indexFace(buffer, externalImageId);
}

