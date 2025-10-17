import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['nb', 'en'],
  defaultLocale: 'nb',
  localePrefix: 'as-needed',
  localeDetection: false,
});
