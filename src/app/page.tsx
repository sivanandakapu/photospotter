'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    name: '',
    date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/events`);
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch events');
      setLoading(false);
    }
  };

  const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          date: formData.get('date'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      form.reset();
    } catch (error) {
      setError('Failed to create event');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Photo Spotter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={createEvent} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Event
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Events</h2>
          {loading ? (
            <p>Loading events...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event: any) => (
                <li key={event.id} className="border-b pb-4">
                  <h3 className="text-xl font-medium">{event.name}</h3>
                  <p className="text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <div className="mt-2 space-x-4">
                    <Link
                      href={`/events/${event.id}/register`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Guest Registration
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
} 