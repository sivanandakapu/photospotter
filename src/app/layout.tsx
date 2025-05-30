import React from 'react'
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpotPhotos - Capture. Spot. Smile.',
  description: 'Event photo sharing made easy with facial recognition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
              <a 
                href="/events" 
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Events
              </a>
              <a 
                href="/photographer" 
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Photographer
              </a>
              <a 
                href="/spot-check" 
                className="text-secondary hover:text-primary relative py-2 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Spot Check
              </a>
            </div>
          </div>
        </nav>

        <main className="min-h-screen py-8">
          <div className="container animate-fade-in">
            {children}
          </div>
        </main>

        <footer className="border-t border-border bg-card">
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/logo.png"
                  alt="SpotPhotos Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div>
                  <h3 className="text-xl font-bold">SpotPhotos</h3>
                  <p className="text-muted text-sm">Event photo sharing made easy with facial recognition.</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <div className="flex flex-col gap-3">
                  <a 
                    href="/events" 
                    className="text-secondary hover:text-primary transition-colors duration-200 w-fit"
                  >
                    Events
                  </a>
                  <a 
                    href="/photographer" 
                    className="text-secondary hover:text-primary transition-colors duration-200 w-fit"
                  >
                    Photographer
                  </a>
                  <a 
                    href="/spot-check" 
                    className="text-secondary hover:text-primary transition-colors duration-200 w-fit"
                  >
                    Spot Check
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <p className="text-muted">Have questions? Get in touch with us.</p>
                <a 
                  href="mailto:contact@spotphotos.com" 
                  className="text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  contact@spotphotos.com
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border text-center text-muted">
              <p>&copy; {new Date().getFullYear()} SpotPhotos. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 