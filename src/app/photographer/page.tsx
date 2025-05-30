'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface Event {
  id: string;
  name: string;
  date: string;
}

interface UploadStatus {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  matches?: number;
}

export default function PhotographerDashboard() {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch events when component mounts
  useEffect(() => {
    const baseUrl = window.location.origin;
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedEventId) {
      alert('Please select an event first');
      return;
    }

    setIsUploading(true);

    // Initialize status for all files
    const initialStatuses = acceptedFiles.map(file => ({
      fileName: file.name,
      status: 'pending' as const,
      progress: 0,
    }));
    setUploadStatuses(initialStatuses);

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('eventId', selectedEventId);

      try {
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { ...status, status: 'uploading', progress: 10 } : status
        ));
        
        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { 
            ...status, 
            status: 'success', 
            progress: 100,
            matches: data.matches?.length || 0
          } : status
        ));

        // Add a delay between uploads to ensure proper indexing
        if (i < acceptedFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadStatuses(prev => prev.map((status, idx) => 
          idx === i ? { ...status, status: 'error', progress: 0 } : status
        ));
      }
    }

    setIsUploading(false);
  }, [selectedEventId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true,
    disabled: !selectedEventId || isUploading
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Photographer's Dashboard</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            setUploadStatuses([]);
          }}
          className="w-full p-2 border rounded-md bg-white"
          disabled={isUploading}
        >
          <option value="">Select an event...</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 
          !selectedEventId ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
          isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' :
          'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            />
          </svg>
          <div className="text-lg">
            {!selectedEventId ? 'Please select an event first' :
             isDragActive ? 'Drop the photos here...' :
             isUploading ? 'Uploading...' :
             'Drag and drop photos here, or click to select'}
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: JPEG, JPG, PNG
          </p>
        </div>
      </div>

      {uploadStatuses.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Upload Status</h2>
          <div className="space-y-4">
            {uploadStatuses.map((status, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium truncate">{status.fileName}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    status.status === 'success' ? 'bg-green-100 text-green-800' :
                    status.status === 'error' ? 'bg-red-100 text-red-800' :
                    status.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </span>
                </div>
                {status.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                )}
                {status.status === 'success' && (
                  <p className="text-sm text-gray-600">
                    Found {status.matches} matching {status.matches === 1 ? 'face' : 'faces'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 