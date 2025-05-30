import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createEvent, getEvents } from '@/lib/dynamodb';

const EventSchema = z.object({
  name: z.string().min(1),
  date: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = EventSchema.parse(body);

    const event = await createEvent(validatedData);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const events = await getEvents();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 