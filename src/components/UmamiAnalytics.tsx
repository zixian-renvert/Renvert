'use client';

import Script from 'next/script';

export default function UmamiAnalytics() {
  // Skip if not production or no website ID
  // if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
  // 	return null
  // }

  return (
    <Script
      src="https://analytics.medal.social/script.js"
      data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
