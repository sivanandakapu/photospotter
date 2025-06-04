'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Sign in to your account
          </h2>
        </div>
        <button
          onClick={() => signIn('cognito', { callbackUrl })}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in with AWS Cognito
        </button>
        <p className="text-center text-muted text-sm">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign Up
          </a>
        </p>
      </div>
      <button
        onClick={() => signIn('cognito', { callbackUrl })}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Sign in with AWS Cognito
      </button>
    </div>
  );
}
