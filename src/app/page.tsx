'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function Home() {
  const { data: session } = useSession();
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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold">
          Capture Moments, <span className="text-primary">Share Joy</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Seamlessly connect event photos with guests using advanced facial recognition technology.
          Make your events more memorable.
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <>
              <Link
                href="/events"
                className="button button-primary"
              >
                Create Event
              </Link>
              <Link
                href="/spot-check"
                className="button button-secondary"
              >
                Find Your Photos
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="button button-primary"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="button button-primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Smart Photo Matching</h3>
          <p className="text-muted">
            Our AI-powered facial recognition ensures guests receive all their photos automatically.
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Easy Photo Upload</h3>
          <p className="text-muted">
            Photographers can quickly upload photos during or after the event.
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Instant Access</h3>
          <p className="text-muted">
            Guests can find and download their photos immediately through our Spot Check feature.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">1</div>
            <h3 className="font-bold mb-2">Create Event</h3>
            <p className="text-muted">Set up your event in minutes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">2</div>
            <h3 className="font-bold mb-2">Register Guests</h3>
            <p className="text-muted">Add guests with their photos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">3</div>
            <h3 className="font-bold mb-2">Upload Photos</h3>
            <p className="text-muted">Photographers upload event photos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">4</div>
            <h3 className="font-bold mb-2">Auto-Match</h3>
            <p className="text-muted">AI matches photos to guests</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-card rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted mb-8">
          Create your first event and experience the magic of automated photo sharing by Signing Up below.
        </p>
        <Link
          href="/auth/signup"
          className="button button-primary"
        >
          Sign Up
        </Link>
      </section>
    </div>
  );
} 