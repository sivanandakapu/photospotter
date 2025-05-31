'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface Event {
  id: string;
  name: string;
  date: string;
}

interface UploadedPhoto {
  id: string;
  url: string;
  eventId: string;
}

export default function PhotographerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const files = formData.getAll('photos');

    if (files.length === 0) {
      setError('Please select photos to upload');
      setLoading(false);
      return;
    }

    if (!selectedEvent) {
      setError('Please select an event');
      setLoading(false);
      return;
    }

    try {
      // Initialize progress array
      setUploadProgress(new Array(files.length).fill(0));

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const photoData = new FormData();
        photoData.append('photo', file);
        photoData.append('eventId', selectedEvent);

        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(prev => {
              const newProgress = [...prev];
              newProgress[index] = progress;
              return newProgress;
            });
          }
        };

        // Create a promise for the XHR request
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 201) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error('Upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
        });

        // Send the request
        xhr.open('POST', '/api/photos', true);
        xhr.send(photoData);

        return uploadPromise;
      });

      const newPhotos = await Promise.all(uploadPromises);
      setUploadedPhotos(prev => [...newPhotos.map(p => p as UploadedPhoto), ...prev]);
      setSuccess('Photos uploaded successfully!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadProgress([]);
    } catch (err) {
      setError('Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Photographer Upload</h1>
        <p className="text-xl text-muted">Upload event photos for automatic face matching.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Upload Photos</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="event" className="block text-sm font-medium mb-2">
                Select Event
              </label>
              <select
                name="event"
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
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
              <label htmlFor="photos" className="block text-sm font-medium mb-2">
                Upload Photos
              </label>
              <input
                type="file"
                name="photos"
                id="photos"
                accept="image/*"
                multiple
                required
                ref={fileInputRef}
                className="input file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
              />
              <p className="text-muted text-sm mt-2">
                You can select multiple photos to upload at once
              </p>
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-2">
                {uploadProgress.map((progress, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Photo {index + 1}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="button button-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Photos'}
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

        {/* Uploaded Photos */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recently Uploaded</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {uploadedPhotos.length === 0 ? (
              <p className="text-muted text-center py-8 col-span-full">
                No photos uploaded yet. Start by uploading some photos!
              </p>
            ) : (
              uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  {photo.url && (
                    <Image
                      src={photo.url}
                      alt="Uploaded photo"
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      unoptimized
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 