import { NextResponse } from 'next/server';
import { deleteAllFacesFromCollection } from '@/lib/aws';

export async function POST() {
  try {
    await deleteAllFacesFromCollection();
    return NextResponse.json({ message: 'Successfully cleaned up InsightFace data' });
  } catch (error) {
    console.error('Error cleaning up InsightFace data:', error);
    return NextResponse.json(
      { error: 'Failed to clean up InsightFace data' },
      { status: 500 }
    );
  }
}
