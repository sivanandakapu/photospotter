import { NextResponse } from 'next/server';
import { getPhoto } from '@/lib/dynamodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const photo = await getPhoto(params.id);

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
} 