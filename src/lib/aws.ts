import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { 
  RekognitionClient, 
  IndexFacesCommand,
  SearchFacesByImageCommand,
  SearchFacesCommand,
  ListFacesCommand,
  DeleteFacesCommand
} from '@aws-sdk/client-rekognition';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET_ORIGINALS!;
const REKOG_COLLECTION = process.env.REKOG_COLLECTION!;
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

export async function indexFaceInRekognition(buffer: Buffer, externalImageId?: string): Promise<string> {
  const response = await rekognitionClient.send(new IndexFacesCommand({
    CollectionId: REKOG_COLLECTION,
    Image: { Bytes: buffer },
    MaxFaces: 1,
    QualityFilter: 'AUTO',
    DetectionAttributes: ['DEFAULT'],
    ExternalImageId: externalImageId,
  }));

  if (!response.FaceRecords || response.FaceRecords.length === 0) {
    throw new Error('No face detected in the image');
  }

  const faceId = response.FaceRecords[0].Face?.FaceId;
  if (!faceId) {
    throw new Error('Failed to get Face ID');
  }

  return faceId;
}

export async function searchFacesByImage(imageBuffer: Buffer) {
  const command = new SearchFacesByImageCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    Image: {
      Bytes: imageBuffer,
    },
    MaxFaces: 5,
    FaceMatchThreshold: 70,
  });

  const response = await rekognitionClient.send(command);
  return response.FaceMatches || [];
}

export async function indexFace(imageBuffer: Buffer) {
  const command = new IndexFacesCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    Image: {
      Bytes: imageBuffer,
    },
    MaxFaces: 1,
    QualityFilter: 'AUTO',
  });

  const response = await rekognitionClient.send(command);
  return response.FaceRecords?.[0]?.Face?.FaceId;
}

export async function searchFaces(faceId: string) {
  const command = new SearchFacesCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    FaceId: faceId,
    MaxFaces: 100,
    FaceMatchThreshold: 70,
  });

  const response = await rekognitionClient.send(command);
  return response.FaceMatches || [];
}

export async function deleteAllFacesFromCollection() {
  try {
    // First, list all faces in the collection
    const listFacesCommand = new ListFacesCommand({
      CollectionId: REKOG_COLLECTION,
      MaxResults: 4096 // Maximum allowed
    });

    const facesResponse = await rekognitionClient.send(listFacesCommand);
    const faceIds = facesResponse.Faces?.map(face => face.FaceId).filter(Boolean) as string[];

    if (!faceIds || faceIds.length === 0) {
      console.log('No faces found in collection');
      return;
    }

    console.log(`Found ${faceIds.length} faces to delete`);

    // Delete faces in batches of 1000 (AWS limit)
    for (let i = 0; i < faceIds.length; i += 1000) {
      const batch = faceIds.slice(i, i + 1000);
      const deleteCommand = new DeleteFacesCommand({
        CollectionId: REKOG_COLLECTION,
        FaceIds: batch
      });

      await rekognitionClient.send(deleteCommand);
      console.log(`Deleted batch of ${batch.length} faces`);
    }

    console.log('Successfully deleted all faces from collection');
  } catch (error) {
    console.error('Error deleting faces:', error);
    throw error;
  }
} 