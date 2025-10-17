'use client';

import { useTranslations } from 'next-intl';

type UserType = 'landlord' | 'cleaner' | null;

interface OnboardingStep1Props {
  onUserTypeSelect: (userType: UserType) => void;
}

export default function OnboardingStep1({ onUserTypeSelect }: OnboardingStep1Props) {
  const t = useTranslations('onboarding');

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('step2.title')}</h2>
        <p className="text-lg text-muted-foreground">{t('step2.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <button
          onClick={() => onUserTypeSelect('landlord')}
          className="group p-8 rounded-xl hover:bg-accent/50 transition-all duration-300 text-left bg-card"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-6 h-6 text-primary"
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
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {t('step2.role-selection.landlord')}
              </h3>
            </div>
            <p className="text-muted-foreground">
              {t('step2.role-selection.landlord-description')}
            </p>
          </div>
        </button>

        <button
          onClick={() => onUserTypeSelect('cleaner')}
          className="group p-8 rounded-xl hover:bg-accent/50 transition-all duration-300 text-left bg-card"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {t('step2.role-selection.cleaner')}
              </h3>
            </div>
            <p className="text-muted-foreground">{t('step2.role-selection.cleaner-description')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
