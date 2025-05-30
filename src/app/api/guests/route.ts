import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uploadToS3, indexFaceInRekognition } from '@/lib/aws';
import { createGuest, getEventGuests } from '@/lib/dynamodb';
import { resizeImageForRekognition } from '@/lib/image';

const GuestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  eventId: z.string(),
  selfie: z.instanceof(Buffer),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const selfieFile = formData.get('selfie') as File;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const eventId = formData.get('eventId') as string;
    
    console.log('POST /api/guests - Received registration request:', {
      name,
      email,
      phone,
      eventId,
      hasSelfie: !!selfieFile
    });
    
    if (!selfieFile || !name || !email || !phone || !eventId) {
      console.log('POST /api/guests - Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    console.log('POST /api/guests - Converted selfie to buffer');
    
    // Upload original selfie to S3
    const selfieUrl = await uploadToS3(selfieBuffer, selfieFile.type);
    console.log('POST /api/guests - Uploaded selfie to S3:', selfieUrl);
    
    // Resize selfie for Rekognition
    const resizedBuffer = await resizeImageForRekognition(selfieBuffer);
    console.log('POST /api/guests - Resized selfie for Rekognition');
    
    // Index face in Rekognition using the resized image
    console.log('POST /api/guests - Indexing face in Rekognition...');
    const faceId = await indexFaceInRekognition(resizedBuffer);
    console.log('POST /api/guests - Got face ID:', faceId);
    
    // Create guest record
    const guestData = {
      name,
      email,
      phone,
      eventId,
      selfieUrl: `${selfieUrl}#${faceId}`, // Store FaceId with URL
    };
    console.log('POST /api/guests - Creating guest record:', guestData);
    const guest = await createGuest(guestData);
    console.log('POST /api/guests - Created guest record:', guest);

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error('Error registering guest:', error);
    return NextResponse.json(
      { error: 'Failed to register guest', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    console.log('GET /api/guests - Received eventId:', eventId);

    if (!eventId) {
      console.log('GET /api/guests - Missing eventId');
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    console.log('GET /api/guests - Fetching guests for event:', eventId);
    const guests = await getEventGuests(eventId);
    console.log('GET /api/guests - Found guests:', guests);

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guests', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 