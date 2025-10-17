'use client';

import CompanySearch from '@/components/CompanySearch';
import { Checkbox } from '@/components/ui/checkbox';
import type { BrregCompany, LandlordType, Property } from '@/types/onboarding';
import { Building2, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import PropertyForm from './PropertyForm';

interface LandlordStep3Props {
  landlordType: LandlordType;
  selectedCompany: BrregCompany | null;
  properties: Property[];
  termsAccepted: boolean;
  onLandlordTypeChange: (type: LandlordType) => void;
  onCompanySelect: (company: BrregCompany | null) => void;
  onAddProperty: () => void;
  onUpdateProperty: (id: string, field: keyof Property, value: any) => void;
  onRemoveProperty: (id: string) => void;
  onTermsChange: (accepted: boolean) => void;
}

export default function LandlordStep3({
  landlordType,
  selectedCompany,
  properties,
  termsAccepted,
  onLandlordTypeChange,
  onCompanySelect,
  onAddProperty,
  onUpdateProperty,
  onRemoveProperty,
  onTermsChange,
}: LandlordStep3Props) {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const [termsError, setTermsError] = useState<string | null>(null);
  
  // Listen for field errors from parent component
  typeof window !== 'undefined' &&
    window.addEventListener('onboarding:fieldErrors', (e: any) => {
      setTermsError(e.detail?.termsAccepted || null);
    });

  return (
    <div className="space-y-8">
      {/* Title and subtitle only show for companies */}
      {landlordType === 'company' && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {t('step3.landlord.title')}
          </h2>
          <p className="text-lg text-muted-foreground">{t('step3.landlord.subtitle')}</p>
        </div>
      )}

      {/* Simple Landlord Type Selection */}
      {!landlordType && (
        <div className="flex justify-center space-x-8">
          <button
            type="button"
            onClick={() => onLandlordTypeChange('private')}
            className="flex flex-col items-center space-y-3 p-6 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <span className="font-medium">{t('step3.landlord.type.private')}</span>
          </button>

          <button
            type="button"
            onClick={() => onLandlordTypeChange('company')}
            className="flex flex-col items-center space-y-3 p-6 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <span className="font-medium">{t('step3.landlord.type.company')}</span>
          </button>
        </div>
      )}

      {/* Company Information - Only show if company type is selected */}
      {landlordType === 'company' && (
        <div className="space-y-6 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold text-foreground">
            {t('step3.landlord.company.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('step3.cleaner.company.norwegian-companies-note')}
          </p>

          <CompanySearch
            onCompanySelect={onCompanySelect}
            selectedCompany={selectedCompany}
            label={t('step3.cleaner.company.company-registration')}
            placeholder={t('step3.cleaner.company.search-placeholder')}
            required={true}
          />
        </div>
      )}

      {/* Properties - Show for both private and company */}
      {landlordType && (
        <PropertyForm
          properties={properties}
          onAddProperty={onAddProperty}
          onUpdateProperty={onUpdateProperty}
          onRemoveProperty={onRemoveProperty}
        />
      )}

      {/* Terms and Conditions - Show only when landlordType is selected */}
      {landlordType && (
        <div className="space-y-4 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">
            {t('step3.landlord.terms.title')}
          </h3>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-landlord"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsChange(checked === true)}
              className="mt-1"
            />
            <label htmlFor="terms-landlord" className="text-sm text-foreground cursor-pointer">
              {t('step3.landlord.terms.text')}{' '}
              <a
                href={`/${locale}/vilkar-og-betingelser-utleiere`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('step3.landlord.terms.link')}
              </a>
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>
          {termsError && (
            <p className="text-xs text-destructive">{termsError}</p>
          )}
        </div>
      )}
    </div>
  );
}
