'use client';

import { GoogleOneTap } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function GoogleOneTapWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleOneTap
        cancelOnTapOutside={false}
        itpSupport={true}
        fedCmSupport={true}
        signInForceRedirectUrl="/onboarding"
        signUpForceRedirectUrl="/onboarding"
      />
      {children}
    </>
  );
}
