'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const dbUser = useQuery(
    api.users.getUserById, 
    userId ? { userId } : 'skip'
  );
  
  const createUser = useMutation(api.users.createUser);

  // Create/update user in Convex database when they sign in (only once)
  useEffect(() => {
    if (isSignedIn && userId && user && !dbUser) {
      createUser({
        userId: userId,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || undefined,
        pictureUrl: user.imageUrl || undefined,
      }).catch((error) => {
        console.error('Error creating/updating user in Convex:', error);
      });
    }
  }, [isSignedIn, userId, user, dbUser, createUser]);

  useEffect(() => {
    if (!isLoaded) return;

    // If user is not signed in, no redirects needed
    if (!isSignedIn) return;

    // Wait for user data to load (skip if query is disabled)
    if (userId && dbUser === undefined) return;

    // Handle locale prefix according to routing configuration
    // Default locale (nb) doesn't need prefix, others do
    const getLocalizedPath = (path: string) => {
      return locale === 'nb' ? path : `/${locale}${path}`;
    };

    // Get the base path without locale for comparison
    const pathWithoutLocale = locale === 'nb' 
      ? pathname  // For Norwegian, the path is already without locale
      : pathname.replace(`/${locale}`, '') || '/';  // For others, remove locale prefix

    const onboardingPath = getLocalizedPath('/onboarding');
    const dashboardPath = getLocalizedPath('/dashboard');

    // Debug logs (remove in production)
    // console.log('🔍 OnboardingGuard Debug:');
    // console.log('  - Current pathname:', pathname);
    // console.log('  - Locale:', locale);
    // console.log('  - Path without locale:', pathWithoutLocale);
    // console.log('  - Onboarding path:', onboardingPath);
    // console.log('  - Dashboard path:', dashboardPath);
    // console.log('  - User onboarded:', dbUser?.onboarded);

    // CRITICAL: If user is logged in but not onboarded, redirect to onboarding from ANY route
    if (isSignedIn && dbUser && !dbUser.onboarded) {
      // Only allow access to onboarding page itself and auth pages
      if (pathWithoutLocale !== '/onboarding' && !pathWithoutLocale.startsWith('/sign-')) {
        // console.log('🔄 Redirecting to onboarding:', onboardingPath);
        router.push(onboardingPath);
        return;
      }
    }

    // If user is onboarded and on onboarding page, redirect to dashboard
    if (dbUser?.onboarded && pathWithoutLocale === '/onboarding') {
      // console.log('🔄 Redirecting to dashboard:', dashboardPath);
      router.push(dashboardPath);
      return;
    }
  }, [isLoaded, isSignedIn, dbUser, pathname, router, locale]);

  // Don't block rendering - always show children immediately
  // Authentication and redirects happen in the background

  // User is properly authenticated and meets all requirements
  return <>{children}</>;
}
