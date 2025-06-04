import { NextResponse } from 'next/server';
import { uploadToS3, searchFacesByImage, indexFaceInRekognition } from '@/lib/aws';
import {
  createPhoto,
  getEventPhotos,
  createPhotoFace,
  getEvent,
  getEventGuests
} from '@/lib/dynamodb';
import { resizeImageForRekognition } from '@/lib/image';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const photoFile = formData.get('photo') as File;
    const eventId = formData.get('eventId') as string;
    
    console.log('POST /api/photos - Received photo upload request for event:', eventId);
    
    if (!photoFile || !eventId) {
      return NextResponse.json(
        { error: 'Photo and event ID are required' },
        { status: 400 }
      );
    }

    const event = await getEvent(eventId);
    if (!event || (event as any).ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
    console.log('POST /api/photos - Converted photo to buffer');

    // Generate photo ID first
    const photoId = uuidv4();

    // Upload original photo to S3
    const photoUrl = await uploadToS3(photoBuffer, photoFile.type);
    console.log('POST /api/photos - Uploaded photo to S3:', photoUrl);

    // Create photo record
    const photo = await createPhoto({
      url: photoUrl,
      eventId,
    });
    console.log('POST /api/photos - Created photo record:', photo);

    // Use the generated photo.id for Rekognition
    const photoIdForRekognition = photo.id;

    // Resize image for Rekognition
    const resizedBuffer = await resizeImageForRekognition(photoBuffer);
    console.log('POST /api/photos - Resized photo for Rekognition');

    // Index face in Rekognition with retries
    let faceId = null;
    let retries = 0;
    
    while (retries < MAX_RETRIES && !faceId) {
      try {
        console.log(`POST /api/photos - Indexing face in Rekognition (attempt ${retries + 1})...`);
        faceId = await indexFaceInRekognition(resizedBuffer, photoIdForRekognition);
        console.log('POST /api/photos - Got face ID:', faceId);
      } catch (error) {
        console.error(`POST /api/photos - Failed to index face (attempt ${retries + 1}):`, error);
        retries++;
        if (retries < MAX_RETRIES) {
          await wait(RETRY_DELAY);
        }
      }
    }

    if (!faceId) {
      throw new Error('Failed to index face after multiple attempts');
    }

    // Store face record
    const face = await createPhotoFace({
      photoId: photo.id,
      faceId,
      confidence: 100,
      boundingBox: {
        Height: 0,
        Left: 0,
        Top: 0,
        Width: 0,
      },
    });
    console.log('POST /api/photos - Stored face:', face);

    // Wait a bit to ensure indexing is complete
    await wait(1000);

    // Return the complete photo object
    return NextResponse.json({ 
      photo: {
        id: photo.id,
        url: photo.url,
        eventId: photo.eventId
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload and process photo' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await getEvent(eventId);
    if (!event || (event as any).ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const photos = await getEventPhotos(eventId);

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
} 