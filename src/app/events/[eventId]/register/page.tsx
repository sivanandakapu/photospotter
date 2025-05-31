'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Webcam from 'react-webcam';

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
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const registerGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    let photo = formData.get('photo');

    // If we have a captured image from the camera, use that instead
    if (capturedImage) {
      photo = dataURLtoFile(capturedImage, 'selfie.jpg');
    }

    if (!photo || !(photo instanceof File)) {
      setError('Please select a photo or take a selfie');
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
      setCapturedImage(null);
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
              <label className="block text-sm font-medium mb-2">
                Guest Photo
              </label>
              {showCamera ? (
                <div className="space-y-4">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="button button-secondary w-full"
                  >
                    Take Photo
                  </button>
                </div>
              ) : capturedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video">
                    <Image
                      src={capturedImage}
                      alt="Captured photo"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="button button-secondary w-full"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    accept="image/*"
                    ref={fileInputRef}
                    className="input file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="button button-secondary w-full"
                  >
                    Take Selfie
                  </button>
                </div>
              )}
              <p className="text-muted text-sm mt-2">
                Upload a photo or take a selfie
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