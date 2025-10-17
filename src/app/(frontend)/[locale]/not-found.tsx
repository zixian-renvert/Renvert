import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import type { Locale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { groq } from 'next-sanity';

// Force static rendering even when using getLocale
export const dynamic = 'force-static';

export default async function NotFound() {
  const locale = await getLocale();

  // Try to get 404 page from Sanity CMS
  const page = await get404(locale);

  if (page) {
    // Use Sanity CMS content if available
    return <Modules modules={page.modules || []} page={page} />;
  }

  // Fallback to translation messages if no Sanity page
  return <NotFoundFallback />;
}

// Fallback component using translations
function NotFoundFallback() {
  const t = useTranslations('NotFoundPage');

  return (
    <div className="section text-center">
      <h1 className="text-5xl mb-4">{t('title')}</h1>
      <p className="text-lg">{t('description')}</p>
    </div>
  );
}

async function get404(locale: Locale) {
  return await fetchSanityLive<Sanity.Page>({
    query: groq`*[_type == 'page' && metadata.slug.current == '404' && language == '${locale}'][0]{
			...,
			modules[]{ ${MODULES_QUERY} }
		}`,
  });
}
