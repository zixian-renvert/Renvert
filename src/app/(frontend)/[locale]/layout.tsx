import ConvexClientProvider from '@/components/ConvexClientProvider';
import { GoogleOneTapWrapper } from '@/components/GoogleOneTap';
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const UmamiAnalytics = lazy(() => import('@/components/UmamiAnalytics'));
const CookieManager = lazy(() => import('@/components/cookie-manager').then(module => ({ default: module.CookieManager })));
const OnboardingGuard = lazy(() => import('@/components/OnboardingGuard'));
const AuthStatus = lazy(() => import('@/components/AuthStatus'));
const Announcement = lazy(() => import('@/ui/Announcement'));
const VisualEditingControls = lazy(() => import('@/ui/VisualEditingControls'));

import { routing } from '@/i18n/routing';
import '@/styles/globals.css';
import SkipToContent from '@/ui/SkipToContent';
import Footer from '@/ui/footer';
import Header from '@/ui/header';
import { nbNO } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-elegant',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${inter.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans flex flex-col min-h-screen">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          localization={nbNO}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'shadow-lg',
            },
          }}
        >
          <ConvexClientProvider>
            <Suspense fallback={null}>
              <AuthStatus />
            </Suspense>
            <GoogleOneTapWrapper>
              <NuqsAdapter>
                <NextIntlClientProvider locale={locale}>
                  <SkipToContent />
                  <Suspense fallback={null}>
                    <Announcement />
                  </Suspense>
                  <Header />
                  <main
                    id="main-content"
                    className="flex-1 min-h-[calc(100dvh-var(--header-height)-var(--footer-height))]"
                    tabIndex={-1}
                  >
                    <Suspense fallback={children}>
                      <OnboardingGuard>{children}</OnboardingGuard>
                    </Suspense>
                  </main>
                  <Footer />
                  <Suspense fallback={null}>
                    <VisualEditingControls />
                  </Suspense>
                  <Suspense fallback={null}>
                    <CookieManager mode="modal" />
                  </Suspense>
                </NextIntlClientProvider>
              </NuqsAdapter>
            </GoogleOneTapWrapper>
          </ConvexClientProvider>
        </ClerkProvider>
        <Suspense fallback={null}>
          <UmamiAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
