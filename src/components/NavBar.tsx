'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-border">
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/images/logo.png"
            alt="SpotPhotos Logo"
            width={40}
            height={40}
            className="w-auto h-8"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold">SpotPhotos</span>
            <span className="text-xs text-muted">Capture. Spot. Smile.</span>
          </div>
        </a>
        <div className="flex items-center gap-8">
          {session ? (
            <>
              <span className="text-secondary">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/auth/signin"
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
