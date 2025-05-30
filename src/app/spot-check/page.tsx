'use client';

import React, { useState, useEffect } from 'react';

interface Guest {
  id: string;
  name: string;
  email: string;
  selfieUrl: string;
  eventId: string;
}

interface Photo {
  id: string;
  url: string;
  eventId: string;
}

interface PhotoMatch {
  id: string;
  photoId: string;
  guestId: string;
  confidence: number;
  photo?: Photo;
}

export default function SpotCheck() {
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [matches, setMatches] = useState<PhotoMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch events when component mounts
  useEffect(() => {
    const baseUrl = window.location.origin;
    console.log('Fetching events from:', `${baseUrl}/api/events`);
    fetch(`${baseUrl}/api/events`)
      .then(res => res.json())
      .then(data => {
        console.log('Received events:', data);
        setEvents(data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setError('Failed to fetch events');
      });
  }, []);

  // Fetch guests when event is selected
  useEffect(() => {
    if (selectedEventId) {
      const baseUrl = window.location.origin;
      console.log('Fetching guests for event:', selectedEventId);
      console.log('Fetching from URL:', `${baseUrl}/api/guests?eventId=${selectedEventId}`);
      fetch(`${baseUrl}/api/guests?eventId=${selectedEventId}`)
        .then(async res => {
          const text = await res.text();
          console.log('Raw response:', text);
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Invalid response format');
          }
        })
        .then(data => {
          console.log('Received guests:', data);
          setGuests(data);
        })
        .catch(error => {
          console.error('Error fetching guests:', error);
          setError('Failed to fetch guests');
        });
    } else {
      setGuests([]);
    }
  }, [selectedEventId]);

  // Fetch matches when guest is selected
  useEffect(() => {
    if (selectedGuest) {
      setLoading(true);
      const baseUrl = window.location.origin;
      console.log('Fetching matches for guest:', selectedGuest.id);
      fetch(`${baseUrl}/api/matches?guestId=${selectedGuest.id}`)
        .then(res => res.json())
        .then(async matches => {
          console.log('Received matches:', matches);
          // Fetch photo details for each match
          const matchesWithPhotos = await Promise.all(
            matches.map(async (match: PhotoMatch) => {
              console.log('Fetching photo details for:', match.photoId);
              const photoRes = await fetch(`${baseUrl}/api/photos/${match.photoId}`);
              const photo = await photoRes.json();
              console.log('Received photo details:', photo);
              return { ...match, photo };
            })
          );
          console.log('Final matches with photos:', matchesWithPhotos);
          setMatches(matchesWithPhotos);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching matches:', error);
          setLoading(false);
        });
    } else {
      setMatches([]);
    }
  }, [selectedGuest]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Spot Check</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Guest
              </label>
              <select
                value={selectedGuest?.id || ''}
                onChange={(e) => {
                  const guest = guests.find(g => g.id === e.target.value);
                  setSelectedGuest(guest || null);
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a guest...</option>
                {guests.map(guest => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name} ({guest.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedGuest && (
            <div className="border rounded-lg p-3">
              <h2 className="text-lg font-semibold mb-2">Guest Selfie</h2>
              <div className="relative pt-[100%]">
                <img
                  src={selectedGuest.selfieUrl.split('#')[0]}
                  alt={`${selectedGuest.name}'s selfie`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-4">Loading matches...</div>
          ) : matches.length > 0 ? (
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">Matched Photos ({matches.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {matches.map(match => match.photo && (
                  <div key={match.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <div className="aspect-square">
                      <img
                        src={match.photo.url}
                        alt="Matched photo"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                      {Math.round(match.confidence)}% match
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No matches found</div>
          )}
        </div>
      </div>
    </div>
  );
} 