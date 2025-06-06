import { NextResponse } from 'next/server';
import { 
  getPhotoMatches, 
  getGuest,
  getPhoto,
  createPhotoMatch,
  getEventPhotos
} from '@/lib/dynamodb';
import { searchFaces, searchFacesByImage } from '@/lib/aws';
import { validate as isUUID } from 'uuid';
import { resizeImageForRekognition } from '@/lib/image';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    // Get guest details to get their face ID and event ID
    const guest = await getGuest(guestId);
    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    const eventId = guest.eventId;
    console.log('Fetching matches for guest:', guestId, 'in event:', eventId);

    // Extract face ID from selfie URL
    const guestFaceId = guest.selfieUrl.split('#')[1];
    if (!guestFaceId) {
      return NextResponse.json(
        { error: 'Guest face ID not found' },
        { status: 400 }
      );
    }
    console.log('Searching for matches with face ID:', guestFaceId);

    // Search for faces using AWS Rekognition
    const matches = await searchFaces(guestFaceId);
    console.log('Found raw matches:', JSON.stringify(matches, null, 2));

    // Create photo matches if they don't exist
    const existingMatches = await getPhotoMatches(guestId);
    console.log('Existing matches:', JSON.stringify(existingMatches, null, 2));
    const existingPhotoIds = new Set(existingMatches.map(m => m.photoId));

    const newMatches = [];
    const processedPhotoIds = new Set(); // Track processed photo IDs to avoid duplicates
    
    console.log('Processing matches...');
    for (const match of matches) {
      if (!match.Face?.ExternalImageId) {
        console.log('Skipping match without ExternalImageId:', match);
        continue;
      }
      
      const photoId = match.Face.ExternalImageId;
      
      // Log all potential matches for debugging
      console.log('\nProcessing potential match:', {
        photoId,
        similarity: match.Similarity,
        confidence: match.Face.Confidence,
        isUUID: isUUID(photoId)
      });
      
      // Skip if we've already processed this photo or if it's already in existing matches
      if (processedPhotoIds.has(photoId) || existingPhotoIds.has(photoId)) {
        console.log('Skipping already processed photo:', photoId);
        continue;
      }
      
      // Verify the photo exists in DynamoDB and belongs to the same event
      const photo = await getPhoto(photoId);
      if (!photo) {
        console.log('Photo not found in DynamoDB:', photoId);
        continue;
      }

      // Skip if photo is from a different event
      if (photo.eventId !== eventId) {
        console.log('Skipping photo from different event:', photoId, photo.eventId);
        continue;
      }
      
      console.log('Found valid photo match:', {
        photoId,
        similarity: match.Similarity,
        confidence: match.Face.Confidence,
        photo
      });
      
      processedPhotoIds.add(photoId);
      const photoMatch = await createPhotoMatch({
        photoId,
        guestId,
        confidence: match.Similarity || 0,
      });
      console.log('Created new photo match:', photoMatch);
      newMatches.push(photoMatch);
    }

    console.log('New matches created:', newMatches.length);

    // Get all matches (existing + new)
    const allMatches = [...existingMatches, ...newMatches];
    console.log('Total matches:', allMatches.length);

    // Get photo details for each match and filter by event
    const matchesWithPhotos = await Promise.all(
      allMatches.map(async (match) => {
        const photo = await getPhoto(match.photoId);
        // Only include photos from the same event
        if (photo && photo.eventId === eventId) {
          return { ...match, photo };
        }
        console.log('Filtered out photo from different event:', {
          photoId: match.photoId,
          photoEventId: photo?.eventId,
          currentEventId: eventId
        });
        return null;
      })
    );

    // Filter out any matches where we couldn't find the photo or from different events
    const validMatches = matchesWithPhotos.filter(match => match !== null);
    console.log('Final valid matches:', validMatches.length);

    return NextResponse.json(validMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const eventId = formData.get('eventId') as string;

    if (!photo || !eventId) {
      return NextResponse.json(
        { error: 'Photo and event ID are required' },
        { status: 400 }
      );
    }

    // Get all photos for this event first
    const eventPhotos = await getEventPhotos(eventId);
    if (!eventPhotos?.length) {
      return NextResponse.json([]);
    }

    // Convert photo to buffer and resize for Rekognition
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const resizedBuffer = await resizeImageForRekognition(photoBuffer);

    // Search for matching faces
    const matches = await searchFacesByImage(resizedBuffer);
    console.log('Found matches:', matches);

    // Process matches
    const processedMatches = [];
    const processedPhotoIds = new Set();

    for (const match of matches) {
      if (!match.Face?.ExternalImageId) continue;
      
      const photoId = match.Face.ExternalImageId;
      if (processedPhotoIds.has(photoId)) continue;
      
      // Only include photos from this event
      const photo = eventPhotos.find(p => p.id === photoId);
      if (!photo) continue;

      processedPhotoIds.add(photoId);
      processedMatches.push({
        photoId,
        photo,
        confidence: match.Similarity || 0
      });
    }

    return NextResponse.json(processedMatches);
  } catch (error) {
    console.error('Error processing photo match:', error);
    return NextResponse.json(
      { error: 'Failed to process photo match' },
      { status: 500 }
    );
  }
} 