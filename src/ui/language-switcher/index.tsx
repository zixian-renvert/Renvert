import { routing } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

interface LocaleSwitcherProps {
  className?: string;
  variant?: 'default' | 'ghost';
}

export default function LocaleSwitcher({ className, variant = 'ghost' }: LocaleSwitcherProps = {}) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      label={t('label')}
      className={className}
      variant={variant}
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {t('locale', { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
