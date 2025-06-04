'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <button
        onClick={() => signIn('cognito', { callbackUrl })}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Sign in with AWS Cognito
      </button>
    </div>
  );
}
