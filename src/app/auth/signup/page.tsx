'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignUp() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Create your account
          </h2>
        </div>
        <button
          onClick={() => signIn('cognito', { callbackUrl, screen_hint: 'signup' })}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign up with AWS Cognito
        </button>
        <p className="text-center text-muted text-sm">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-primary hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
