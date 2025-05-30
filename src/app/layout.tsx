import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Photo Spotter - Event Photo Sharing',
  description: 'Automatically match and share event photos with guests using facial recognition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-indigo-600">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-white text-xl font-bold">
                Photo Spotter
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
} 