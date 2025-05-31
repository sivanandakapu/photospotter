'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const params = useParams();
  const eventId = params.eventId as string;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId);

        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      setSuccess(true);
      setUploadedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Upload Event Photos</h1>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 mb-6 rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-indigo-500'}`}
      >
        <input {...getInputProps()} />
        <p className="text-slate-300">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop photos here, or click to select files'}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-100">Selected Files</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <p className="mt-1 text-sm text-slate-400 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg mb-4">
          Files uploaded successfully!
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || uploadedFiles.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors
          ${uploading || uploadedFiles.length === 0
            ? 'bg-slate-600 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
      >
        {uploading ? 'Uploading...' : 'Upload Photos'}
      </button>
    </div>
  );
} 