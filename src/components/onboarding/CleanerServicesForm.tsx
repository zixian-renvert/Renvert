'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface CleanerServicesFormProps {
  experience: string;
  availability: string;
  services: string[];
  certifications: string[];
  onInputChange: (field: 'experience' | 'availability', value: string) => void;
  onServiceChange: (service: string, checked: boolean) => void;
  onCertificationChange: (certification: string, checked: boolean) => void;
}

export default function CleanerServicesForm({
  experience,
  availability,
  services,
  certifications,
  onInputChange,
  onServiceChange,
  onCertificationChange,
}: CleanerServicesFormProps) {
  const t = useTranslations('onboarding');

  const availableCertifications = [
    'HMS Card',
    'First Aid',
    'Fire Safety',
    'Chemical Safety',
    'Working at Heights',
    'Asbestos Awareness',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Experience and Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-medium text-foreground">
            {t('step3.cleaner.experience')}
          </label>
          <Input
            id="experience"
            value={experience}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange('experience', e.target.value)
            }
            placeholder={t('step3.cleaner.experience-placeholder')}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="availability" className="text-sm font-medium text-foreground">
            {t('step3.cleaner.availability')}
          </label>
          <Input
            id="availability"
            value={availability}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange('availability', e.target.value)
            }
            placeholder={t('step3.cleaner.availability-placeholder')}
            className="h-11"
          />
        </div>
      </div>

      {/* Service Information */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Platform sets pricing for all services. You just need to select which services you offer.
        </p>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-foreground">{t('step3.cleaner.services')}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(t.raw('step3.cleaner.services-options') as Record<string, string>).map(
            ([key, label]) => (
              <label
                key={key}
                className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={services.includes(key)}
                  onCheckedChange={(checked) => onServiceChange(key, checked as boolean)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-foreground">Certifications & Training</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableCertifications.map((cert) => (
            <label
              key={cert}
              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={certifications.includes(cert)}
                onCheckedChange={(checked) => onCertificationChange(cert, checked as boolean)}
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm text-foreground">{cert}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
