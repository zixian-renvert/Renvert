'use server';
import { getSite } from '@/sanity/lib/fetch';
import { getLocale } from 'next-intl/server';
import ModernHeader from './modern-header';

export default async function HeaderWrapper() {
  const locale = await getLocale();
  const { title, logo, ctas, headerMenu } = await getSite(locale);

  return <ModernHeader title={title} logo={logo} ctas={ctas} headerMenu={headerMenu} />;
}
