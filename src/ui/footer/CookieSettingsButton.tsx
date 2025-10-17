'use client';

import { Cookie } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CookieSettingsButton() {
  const t = useTranslations('CookieManager');
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
      className="flex items-center gap-2 text-sm text-gray-200 hover:text-primary transition-colors py-2"
      aria-label="Cookie settings"
    >
      <Cookie className="w-4 h-4" />
      <span>{t('cookie-settings')}</span>
    </button>
  );
}
