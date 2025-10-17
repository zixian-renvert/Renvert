'use client';

import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { type ReactNode, useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Use environment variable for Convex URL with optimized settings
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210', {
  // Disable verbose logging for better performance
  verbose: false,
});

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { isLoaded } = useAuth();

  // Always render children immediately - don't block on auth loading
  return (
    <ErrorBoundary>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ErrorBoundary>
  );
}
