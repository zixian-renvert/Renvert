'use server';
import { getSite } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Social from '@/ui/Social';
import { getLocale } from 'next-intl/server';
import { PortableText } from 'next-sanity';
import Link from 'next/link';
import CookieSettingsButton from './CookieSettingsButton';
import Navigation from './Navigation';

export default async function Footer() {
  const locale = await getLocale();
  const { title, tagline, logo, copyright } = await getSite(locale);

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;

  return (
    <footer className="kaizen-footer bg-gray-900 text-white">
      <div className="section flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <Link
            className="block text-xl font-bold mb-2"
            href="/"
            aria-label={`Return to ${title} homepage`}
          >
            {logoImageDark ? (
              <div className="flex items-center gap-2 mb-4">
                <Img className="h-10 w-auto" image={logoImageDark} alt={'Renvert logo'} />
                <span className="text-xl font-bold">Renvert</span>
              </div>
            ) : (
              <span className="text-xl font-bold">Renvert</span>
            )}
          </Link>

          {tagline && (
            <div
              className="max-w-sm text-sm text-balance text-gray-400 mb-4"
              aria-label="Site tagline"
            >
              <PortableText value={tagline} />
            </div>
          )}

          <Social aria-label="Social media links" />
        </div>

        <div className="md:ml-8">
          <Navigation variant="footer" />
        </div>
      </div>
      <div className="section border-t border-gray-700 mt-8 pt-4 pb-2 px-6 flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-200">
        <div className="mb-2 md:mb-0">
          {copyright ? (
            <PortableText value={copyright} />
          ) : (
            <p>
              © {new Date().getFullYear()} {title}. Alle rettigheter reservert.
            </p>
          )}
        </div>
        <CookieSettingsButton />
      </div>
    </footer>
  );
}
