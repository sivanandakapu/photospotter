'use client';

import { useState } from 'react';

export default function TestPage() {
  const [eventId, setEventId] = useState('00c2fa1e-2424-4306-bfbc-51b51f8c5847');
  const [guestResult, setGuestResult] = useState('');
  const [photoResult, setPhotoResult] = useState('');

  const handleGuestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setGuestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setGuestResult(String(error));
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPhotoResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setPhotoResult(String(error));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photo Spotter Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Event ID: {eventId}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Register Guest</h2>
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <input type="hidden" name="eventId" value={eventId} />
            
            <div>
              <label className="block mb-2">Name:</label>
              <input
                type="text"
                name="name"
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Email:</label>
              <input
                type="email"
                name="email"
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Selfie:</label>
              <input
                type="file"
                name="selfie"
                accept="image/*"
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Register Guest
            </button>
          </form>
          
          {guestResult && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {guestResult}
            </pre>
          )}
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Photo</h2>
          <form onSubmit={handlePhotoSubmit} className="space-y-4">
            <input type="hidden" name="eventId" value={eventId} />
            
            <div>
              <label className="block mb-2">Photo:</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Upload Photo
            </button>
          </form>
          
          {photoResult && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {photoResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 