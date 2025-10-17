'use client';

import CompanySearch from '@/components/CompanySearch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { BrregCompany } from '@/types/onboarding';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import HMSCardUpload from './HMSCardUpload';

interface CleanerStep3Props {
  selectedCompany: BrregCompany | null;
  hmsCardFile: File | null;
  experience: string;
  termsAccepted: boolean;
  onCompanySelect: (company: BrregCompany | null) => void;
  onHMSFileSelect: (file: File) => void;
  onHMSFileRemove: () => void;
  onInputChange: (field: 'experience', value: string) => void;
  onTermsChange: (accepted: boolean) => void;
}

export default function CleanerStep3({
  selectedCompany,
  hmsCardFile,
  experience,
  termsAccepted,
  onCompanySelect,
  onHMSFileSelect,
  onHMSFileRemove,
  onInputChange,
  onTermsChange,
}: CleanerStep3Props) {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [hmsFileError, setHmsFileError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  
  typeof window !== 'undefined' &&
    window.addEventListener('onboarding:fieldErrors', (e: any) => {
      setExperienceError(e.detail?.experience || null);
      setHmsFileError(e.detail?.hmsCardFile || null);
      setTermsError(e.detail?.termsAccepted || null);
    });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('step3.cleaner.title')}
        </h2>
        <p className="text-lg text-muted-foreground">{t('step3.cleaner.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <div className="space-y-6 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold text-foreground">
            {t('step3.cleaner.company.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('step3.cleaner.company.norwegian-companies-note')}
          </p>

          {/* Company Search for Cleaners */}
          <CompanySearch
            onCompanySelect={onCompanySelect}
            selectedCompany={selectedCompany}
            label={t('step3.cleaner.company.company-registration')}
            placeholder={t('step3.cleaner.company.search-placeholder')}
            required={true}
          />
        </div>

        {/* HMS Card Upload */}
        <div className="space-y-2">
          <HMSCardUpload
            onFileSelect={onHMSFileSelect}
            onFileRemove={onHMSFileRemove}
            currentFile={hmsCardFile}
          />
          {hmsFileError && (
            <p className="text-xs text-destructive">{hmsFileError}</p>
          )}
        </div>

        {/* Experience - the only mandatory field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('step3.cleaner.experience')}
            <span className="text-destructive ml-1">*</span>
          </label>
          <Textarea
            placeholder={
              t('step3.cleaner.experience-placeholder') ||
              'Describe your cleaning experience, places you worked, responsibilities, and years.'
            }
            value={experience}
            onChange={(e) => onInputChange('experience', e.target.value)}
            minLength={20}
            required
            rows={4}
          />
          {experience.length < 20 && (
            <p className="text-xs text-muted-foreground">
              {t('step3.cleaner.experience-min-remaining', { remaining: 20 - experience.length })}
            </p>
          )}
          {experienceError && <p className="text-xs text-destructive">{experienceError}</p>}
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">
            {t('step3.cleaner.terms.title')}
          </h3>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-cleaner"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked === true)}
              className="mt-1"
            />
            <label htmlFor="terms-cleaner" className="text-sm text-foreground cursor-pointer">
              {t('step3.cleaner.terms.text')}{' '}
              <a
                href={`/${locale}/vilkar-og-betingelser-renholdere`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('step3.cleaner.terms.link')}
              </a>
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>
          {termsError && (
            <p className="text-xs text-destructive">{termsError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
