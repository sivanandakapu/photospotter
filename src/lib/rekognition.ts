import {
  RekognitionClient,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  DeleteFacesCommand,
  Face,
  FaceMatch,
} from '@aws-sdk/client-rekognition';

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function indexFace(imageBuffer: Buffer) {
  const command = new IndexFacesCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    Image: {
      Bytes: imageBuffer,
    },
    MaxFaces: 1,
    QualityFilter: 'AUTO',
    DetectionAttributes: ['ALL'],
  });

  const response = await rekognition.send(command);
  return response.FaceRecords?.[0]?.Face;
}

export async function searchFacesByImage(imageBuffer: Buffer) {
  const command = new SearchFacesByImageCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    Image: {
      Bytes: imageBuffer,
    },
    MaxFaces: 5,
    FaceMatchThreshold: 90,
  });

  const response = await rekognition.send(command);
  return response.FaceMatches || [];
}

export async function deleteFaces(faceIds: string[]) {
  const command = new DeleteFacesCommand({
    CollectionId: process.env.REKOG_COLLECTION,
    FaceIds: faceIds,
  });

  await rekognition.send(command);
} 