'use client';

import { SignUp } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const pathname = usePathname();
  
  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <SignUp
        appearance={{
          elements: {
            card: 'shadow-none border-0 p-0 bg-transparent',
            formButtonPrimary:
              'w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg',
          },
        }}
        signInUrl="../sign-in"
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
