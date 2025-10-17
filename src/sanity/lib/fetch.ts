'use server';

import { dev } from '@/lib/env';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';
import { type QueryOptions, type QueryParams, defineLive, groq } from 'next-sanity';
import { draftMode } from 'next/headers';
import { CTA_QUERY, NAVIGATION_QUERY } from './queries';

export async function fetchSanity<T = any>({
  query,
  params = {},
  next,
}: {
  query: string;
  params?: Partial<QueryParams>;
  next?: QueryOptions['next'];
}) {
  const preview = dev || (await draftMode()).isEnabled;

  return client.fetch<T>(
    query,
    params,
    preview
      ? {
          stega: true,
          perspective: 'drafts',
          useCdn: false,
          token,
          next: {
            revalidate: 0,
            ...next,
          },
        }
      : {
          perspective: 'published',
          useCdn: true,
          next: {
            revalidate: 3600, // every hour
            ...next,
          },
        }
  );
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

export async function fetchSanityLive<T = any>(args: Parameters<typeof sanityFetch>[0]) {
  const preview = dev || (await draftMode()).isEnabled;

  const { data } = await sanityFetch({
    ...args,
    perspective: preview ? 'drafts' : 'published',
  });

  return data as T;
}

export async function getSite(locale?: string) {
  const localestring = locale || 'nb';
  const site = await fetchSanityLive<Sanity.Site>({
    query: groq`
			*[_type == 'site' && language == '${localestring}'][0]{
				...,
				ctas[]{ ${CTA_QUERY} },
				headerMenu->{ ${NAVIGATION_QUERY} },
				footerMenu->{ ${NAVIGATION_QUERY} },
				socialLinks,
				'ogimage': ogimage.asset->url,
			}
		`,
  });

  if (!site) {
    // Return a safe fallback to avoid hard failures during build
    return {
      title: 'RenVert',
      tagline: null,
      logo: null,
      ctas: [],
      headerMenu: { items: [] },
      footerMenu: { items: [] },
      socialLinks: [],
      ogimage: null,
      language: localestring,
    } as any;
  }

  return site;
}
