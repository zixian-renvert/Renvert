'use client';

import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OnboardingStep2Props {
  name: string;
  phone: string;
  email: string;
  onInputChange: (field: 'name' | 'phone', value: string) => void;
}

export default function OnboardingStep2({
  name,
  phone,
  email,
  onInputChange,
}: OnboardingStep2Props) {
  const t = useTranslations('onboarding');

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-left">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('step1.title')}</h2>
        <p className="text-lg text-muted-foreground">{t('step1.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {t('step2.name')} <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange('name', e.target.value)
            }
            required
            placeholder={t('step2.name-placeholder')}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            {t('step2.phone')} <span className="text-destructive">*</span>
          </label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(value) => onInputChange('phone', value || '')}
            placeholder={t('step2.phone-placeholder')}
            defaultCountry="NO"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t('step2.email')}
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="h-11 bg-muted/50 cursor-not-allowed pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('step2.email-info-description')}</p>
        </div>
      </div>
    </div>
  );
}
