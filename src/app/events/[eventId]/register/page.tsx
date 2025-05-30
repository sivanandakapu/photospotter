'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Webcam from 'react-webcam';

export default function GuestRegistration() {
  const { eventId } = useParams();
  const webcamRef = useRef<Webcam>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelfieImage(imageSrc);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!selfieImage) {
      setError('Please take a selfie');
      setLoading(false);
      return;
    }

    // Convert base64 selfie to blob
    const response = await fetch(selfieImage);
    const blob = await response.blob();
    formData.append('selfie', blob, 'selfie.jpg');
    formData.append('eventId', eventId as string);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/guests`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      setSuccess(true);
      form.reset();
      setSelfieImage(null);
    } catch (error) {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Registration Successful!</h2>
          <p className="text-green-700">
            You have been registered for the event. You will receive SMS notifications when photos of you are uploaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Guest Registration</h1>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Take a Selfie
            </label>
            <div className="relative">
              {!selfieImage ? (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
              ) : (
                <img src={selfieImage} alt="Selfie preview" className="w-full rounded-lg" />
              )}
            </div>
            <button
              type="button"
              onClick={selfieImage ? () => setSelfieImage(null) : captureSelfie}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {selfieImage ? 'Retake Selfie' : 'Capture Selfie'}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
} 