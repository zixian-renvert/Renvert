'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRouteWithFallback({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, router, redirectTo]);

  if (!isLoaded) {
    return <>{fallback}</>;
  }

  if (!isSignedIn) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function ProtectedRoute({
  children,
  redirectTo = '/sign-in',
}: Omit<ProtectedRouteProps, 'fallback'>) {
  return (
    <ProtectedRouteWithFallback redirectTo={redirectTo}>{children}</ProtectedRouteWithFallback>
  );
}
