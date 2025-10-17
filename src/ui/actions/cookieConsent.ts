'use server';

import { headers } from 'next/headers';

export interface CookieRecord {
  cookie: string;
  duration: string;
  description: string;
}

export interface CookieCategory {
  allowed: boolean;
  cookieRecords?: CookieRecord[];
}

export interface CookiePreferences {
  necessary: CookieCategory;
  analytics: CookieCategory;
  marketing: CookieCategory;
  functional: CookieCategory;
}

interface CookieConsentPayload {
  domain: string;
  consentStatus: 'accepted' | 'declined' | 'partial';
  consentTimestamp: string;
  ipAddress: string;
  userAgent: string;
  cookiePreferences: CookiePreferences;
}

export async function submitCookieConsent(
  consentStatus: 'accepted' | 'declined' | 'partial',
  cookiePreferences: CookiePreferences
) {
  const medalapi = process.env.MEDAL_API_ENDPOINT;
  const medalclientid = process.env.MEDAL_SOCIAL_CLIENT_ID;
  const medalclientsecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_URL;

  if (!medalapi || !medalclientid || !medalclientsecret || !baseDomain) {
    return { error: 'Missing environment variables' };
  }

  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress =
      headersList.get('x-real-ip') ||
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      '';

    // Extract domain from the API endpoint
    const domain = baseDomain.replace('https://', '').replace('http://', '').split('/')[0];

    const payload: CookieConsentPayload = {
      domain,
      consentStatus,
      consentTimestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      cookiePreferences,
    };

    const response = await fetch(`${medalapi}/v1/cookie-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': medalclientid,
        'Client-Secret': medalclientsecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit cookie consent: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting cookie consent:', error);
    return { success: false, error: 'Failed to submit cookie consent' };
  }
}
