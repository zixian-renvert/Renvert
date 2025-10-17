'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  canProceed?: boolean;
}

export default function OnboardingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isLoading = false,
  canProceed = true,
}: OnboardingNavigationProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border justify-end">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('navigation.back')}
        </Button>
      )}

      {currentStep < totalSteps ? (
        <Button type="button" onClick={onNext} disabled={!canProceed} size="lg">
          {t('navigation.next')}
        </Button>
      ) : (
        <Button type="submit" onClick={onSubmit} disabled={isLoading || !canProceed} size="lg">
          {isLoading ? t('loading') : t('navigation.complete')}
        </Button>
      )}
    </div>
  );
}
