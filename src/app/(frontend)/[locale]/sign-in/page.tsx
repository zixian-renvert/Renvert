'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <SignIn
        appearance={{
          elements: {
            card: 'shadow-none border-0 p-0 bg-transparent',
            formButtonPrimary:
              'w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg',
          },
        }}
        signUpUrl="../sign-up"
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
