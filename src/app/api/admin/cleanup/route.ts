import { NextResponse } from 'next/server';
import { 
  S3Client, 
  ListObjectsV2Command, 
  DeleteObjectsCommand 
} from '@aws-sdk/client-s3';
import { 
  DynamoDBClient 
} from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';
import { deleteAllFacesFromCollection } from '@/lib/aws';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);


const TABLES = [
  'PhotoSpotterEvents',
  'PhotoSpotterGuests',
  'PhotoSpotterPhotos',
  'PhotoSpotterPhotoFaces',
  'PhotoSpotterPhotoMatches'
];

export async function POST() {
  try {
    console.log('Starting cleanup...');

    // 1. Delete all objects from S3
    console.log('Cleaning S3 bucket...');
    const listObjectsResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_ORIGINALS,
      })
    );

    if (listObjectsResponse.Contents && listObjectsResponse.Contents.length > 0) {
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET_ORIGINALS,
          Delete: {
            Objects: listObjectsResponse.Contents.map(obj => ({
              Key: obj.Key!
            }))
          }
        })
      );
    }
    console.log('S3 bucket cleaned');

    // 2. Delete all stored face embeddings
    console.log('Cleaning InsightFace data...');
    await deleteAllFacesFromCollection();
    console.log('InsightFace data cleaned');

    // 3. Delete all items from DynamoDB tables
    console.log('Cleaning DynamoDB tables...');
    for (const tableName of TABLES) {
      const scanResponse = await docClient.send(
        new ScanCommand({
          TableName: tableName,
        })
      );

      if (scanResponse.Items) {
        for (const item of scanResponse.Items) {
          await docClient.send(
            new DeleteCommand({
              TableName: tableName,
              Key: { id: item.id }
            })
          );
        }
      }
    }
    console.log('DynamoDB tables cleaned');

    return NextResponse.json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to complete cleanup' },
      { status: 500 }
    );
  }
} 