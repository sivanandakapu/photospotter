'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

export default function GuestRegistrationPage() {
  const { eventId } = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const registerGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const photo = formData.get('photo');

    if (!photo || !(photo instanceof File)) {
      setError('Please select a photo');
      setLoading(false);
      return;
    }

    try {
      const guestData = new FormData();
      guestData.append('name', name as string);
      guestData.append('email', email as string);
      guestData.append('phone', phone as string);
      guestData.append('photo', photo);
      guestData.append('eventId', eventId as string);

      const response = await fetch('/api/guests', {
        method: 'POST',
        body: guestData,
      });

      if (!response.ok) {
        throw new Error('Failed to register guest');
      }

      const newGuest = await response.json();
      setGuests([...guests, newGuest]);
      setSuccess('Guest registered successfully!');
      ;(e.target as HTMLFormElement).reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to register guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Guest Registration</h1>
        <p className="text-xl text-muted">Register guests for facial recognition photo matching.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Register New Guest</h2>
          <form onSubmit={registerGuest} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Guest Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="input"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="input"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                className="input"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label htmlFor="photo" className="block text-sm font-medium mb-2">
                Guest Photo
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
                Please upload a clear photo of the guest's face
              </p>
            </div>
            <button
              type="submit"
              className="button button-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Guest'}
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

        {/* Registered Guests */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Registered Guests</h2>
          <div className="space-y-4">
            {guests.length === 0 ? (
              <p className="text-muted text-center py-8">
                No guests registered yet. Register your first guest!
              </p>
            ) : (
              guests.map((guest) => (
                <div key={guest.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={guest.photoUrl}
                      alt={guest.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">{guest.name}</h3>
                    <p className="text-muted text-sm">{guest.email}</p>
                    <p className="text-muted text-sm">{guest.phone}</p>
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