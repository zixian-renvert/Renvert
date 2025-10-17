'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthStatus() {
  const { isLoaded, isSignedIn } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      // Show after 1 second if still loading
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isLoaded]);

  if (!show || isLoaded) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <span className="text-muted-foreground">Loading authentication...</span>
      </div>
    </div>
  );
}
