'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load events')
      setLoading(false)
    }
  }

  const createEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const date = formData.get('date')

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, date }),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const newEvent = await response.json()
      setEvents([...events, newEvent])
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError('Failed to create event')
    }
  }

  const getRegistrationUrl = (eventId: string) => {
    // Use window.location to get the current origin
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/events/${eventId}/register`;
  };

  const downloadQRCode = (eventId: string, eventName: string) => {
    const canvas = document.createElement('canvas');
    const svg = document.getElementById(`qr-${eventId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `${eventName}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Manage Events</h1>
        <p className="text-xl text-muted">Create and manage your photo-sharing events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Event Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
          <form onSubmit={createEvent} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Event Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="input"
                placeholder="Enter event name"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                className="input"
              />
            </div>
            <button
              type="submit"
              className="button button-primary w-full mt-6"
            >
              Create Event
            </button>
          </form>
        </div>

        {/* Events List */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Events</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted mt-4">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-error">{error}</p>
              <button 
                onClick={fetchEvents}
                className="button button-secondary mt-4"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted">No events found. Create your first event!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event: Event) => (
                <div key={event.id} className="p-6 border border-border rounded-lg hover:border-primary transition-colors">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <p className="text-muted">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/events/${event.id}/register`}
                          className="button button-secondary text-sm"
                        >
                          Register Guests
                        </Link>
                        <Link
                          href={`/events/${event.id}/photos`}
                          className="button button-primary text-sm"
                        >
                          View Photos
                        </Link>
                      </div>
                    </div>
                    
                    {/* QR Code Section */}
                    <div className="mt-4 p-4 bg-card rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-shrink-0 bg-white p-2 rounded-lg">
                          <QRCodeSVG
                            id={`qr-${event.id}`}
                            value={getRegistrationUrl(event.id)}
                            size={120}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h4 className="font-medium mb-2">Registration QR Code</h4>
                          <p className="text-sm text-muted mb-4">Scan to register for this event</p>
                          <button
                            onClick={() => downloadQRCode(event.id, event.name)}
                            className="button button-secondary text-sm"
                          >
                            Download QR Code
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 