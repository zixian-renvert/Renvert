import processMetadata from '@/lib/processMetadata';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import {
  GLOBAL_MODULE_QUERY,
  MODULES_QUERY,
  SLUG_QUERY,
  TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { groq } from 'next-sanity';
import { notFound, redirect } from 'next/navigation';

export default async function Page({ params }: Props) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const page = await getPage(await params);
  if (!page) notFound();
  return <Modules modules={page.modules} page={page} />;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getPage(await params);
  if (!page) notFound();
  return processMetadata(page);
}

export async function generateStaticParams() {
  const pages = await client.fetch<{ slug: string; locale: string }[]>(
    groq`*[
			_type == 'page' &&
			defined(metadata.slug.current) 
		]{
			'slug': metadata.slug.current,
			'locale': language
		}`
  );

  return pages
    .filter(({ locale }) => locale && typeof locale === 'string')
    .map(({ slug, locale }) => ({
      slug: slug.split('/'),
      locale,
    }));
}

async function getPage(params: Params) {
  const { slug, locale } = params;
  const slugString = slug?.join('/') ?? 'index';

  // First, try to get the page in the requested locale
  const page = await fetchSanityLive<Sanity.Page>({
    query: groq`*[
			_type == 'page' &&
			${SLUG_QUERY} == $slug 
			${locale ? `&& language == '${locale}'` : ''}
		][0]{
			...,
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// path modules (before)
				+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_QUERY}].before[]{ ${MODULES_QUERY} }
				// page modules
				+ modules[]{ ${MODULES_QUERY} }
				// path modules (after)
				+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_QUERY}].after[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			),
			parent[]->{ metadata { slug } },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
    params: { slug: slugString },
  });

  // If page doesn't exist in requested locale and locale is not the default (nb),
  // check if Norwegian version exists and redirect to it
  if (!page && locale && locale !== 'nb') {
    const norwegianPage = await fetchSanityLive<{
      metadata: { slug: { current: string } };
    }>({
      query: groq`*[
				_type == 'page' &&
				${SLUG_QUERY} == $slug 
				&& language == 'nb'
			][0]{
				metadata { slug }
			}`,
      params: { slug: slugString },
    });

    if (norwegianPage) {
      // Redirect to Norwegian URL (remove /en prefix)
      const norwegianUrl = slugString === 'index' ? '/' : `/${slugString}`;
      redirect(norwegianUrl);
    }
  }

  return page;
}
type Params = { slug?: string[]; locale: Locale };

type Props = {
  params: Promise<Params>;
};
