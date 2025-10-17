'use client';

import { useTranslations } from 'next-intl';

type LandlordType = 'private' | 'company' | null;

interface LandlordTypeSelectionProps {
  selectedType: LandlordType;
  onTypeSelect: (type: LandlordType) => void;
}

export default function LandlordTypeSelection({
  selectedType,
  onTypeSelect,
}: LandlordTypeSelectionProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold text-foreground">{t('step3.landlord.type.title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => onTypeSelect('private')}
          className={`p-6 border-2 rounded-lg transition-all duration-300 text-left ${
            selectedType === 'private'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {t('step3.landlord.type.private')}
            </h4>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('step3.landlord.type.private-description')}
          </p>
        </button>

        <button
          onClick={() => onTypeSelect('company')}
          className={`p-6 border-2 rounded-lg transition-all duration-300 text-left ${
            selectedType === 'company'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {t('step3.landlord.type.company')}
            </h4>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('step3.landlord.type.company-description')}
          </p>
        </button>
      </div>
    </div>
  );
}
