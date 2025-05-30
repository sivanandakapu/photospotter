import { NextResponse } from 'next/server';
import { deleteAllFacesFromCollection } from '@/lib/aws';

export async function POST() {
  try {
    await deleteAllFacesFromCollection();
    return NextResponse.json({ message: 'Successfully cleaned up Rekognition collection' });
  } catch (error) {
    console.error('Error cleaning up Rekognition collection:', error);
    return NextResponse.json(
      { error: 'Failed to clean up Rekognition collection' },
      { status: 500 }
    );
  }
} 