'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface Event {
  id: string;
  name: string;
  date: string;
}

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
  photo: Photo;
}

export default function SpotCheckPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [matches, setMatches] = useState<PhotoMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch events when component mounts
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setMatches([]);

    if (!selectedEventId) {
      setError('Please select an event first');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const photo = formData.get('photo');

    if (!photo || !(photo instanceof File)) {
      setError('Please select a photo');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('photo', photo);
      data.append('eventId', selectedEventId);

      const response = await fetch('/api/matches', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to find matches');
      }

      const matchesData = await response.json();
      setMatches(matchesData);
      setSuccess(
        matchesData.length > 0
          ? `Found ${matchesData.length} matching ${matchesData.length === 1 ? 'photo' : 'photos'}!`
          : 'No matching photos found in this event.'
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to process photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Spot Check</h1>
        <p className="text-xl text-muted">Find your photos from events using facial recognition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Upload Your Photo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="event" className="block text-sm font-medium mb-2">
                Select Event
              </label>
              <select
                id="event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                required
                className="input"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="photo" className="block text-sm font-medium mb-2">
                Select a Photo
              </label>
              <input
                type="file"
                name="photo"
                id="photo"
                accept="image/*"
                required
                ref={fileInputRef}
                className="input file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
              />
              <p className="text-muted text-sm mt-2">
                Upload a clear photo of your face to find matching event photos
              </p>
            </div>
            <button
              type="submit"
              className="button button-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Find My Photos'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-error rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 text-success rounded-lg">
              {success}
            </div>
          )}
        </div>

        {/* Matched Photos */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Photos</h2>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted mt-4">Searching for your photos...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted">
                  {success || 'Upload a photo to start searching'}
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={match.photo.url}
                      alt="Matched photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted">
                        Match Confidence: {Math.round(match.confidence)}%
                      </p>
                      <a
                        href={match.photo.url}
                        download
                        className="button button-secondary text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 