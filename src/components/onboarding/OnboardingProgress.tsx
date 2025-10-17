'use client';

import { useTranslations } from 'next-intl';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const t = useTranslations('onboarding');
  // Show progress for completed steps, not the current in-progress step
  const completedSteps = Math.max(0, Math.min(currentStep - 1, totalSteps));
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span>{t('progress.step', { current: currentStep, total: totalSteps })}</span>
          <span className="text-xs text-muted-foreground/70">({percentage}%)</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
