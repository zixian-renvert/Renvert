'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building2, Home, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceTypeSelectorProps {
  selectedService?: string;
  onServiceChange?: (service: string) => void;
  value?: string;
  onChange?: (service: string) => void;
  className?: string;
  propertySize?: string | number; // Property size in sqm to determine availability
}

export default function ServiceTypeSelector({
  selectedService,
  onServiceChange,
  value,
  onChange,
  className,
  propertySize,
}: ServiceTypeSelectorProps) {
  const t = useTranslations('booking');

  // Use either the new props or the old ones for backward compatibility
  const currentService = value || selectedService || '';
  const handleServiceChange = onChange || onServiceChange || (() => {});
  
  // Parse property size
  const propertySizeNum = propertySize ? Number.parseInt(String(propertySize)) : 0;

  const serviceTypes = [
    {
      id: 'bnb-cleaning',
      icon: Home,
      title: t('serviceTypes.bnb.title'),
      description: t('serviceTypes.bnb.description'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'deep-cleaning',
      icon: Building2,
      title: t('serviceTypes.deep.title'),
      description: t('serviceTypes.deep.description'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'move-out-cleaning',
      icon: Truck,
      title: t('serviceTypes.moveOut.title'),
      description: t('serviceTypes.moveOut.description'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-1 gap-3">
        {serviceTypes.map((service) => {
          const Icon = service.icon;
          const isSelected = currentService === service.id;
          
          // Check if BNB-cleaning is disabled for properties over 100 sqm
          const isBnbDisabled = service.id === 'bnb-cleaning' && propertySizeNum > 100;

          return (
            <button
              key={service.id}
              type="button"
              disabled={isBnbDisabled}
              className={cn(
                'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                'focus:outline-none focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2',
                isBnbDisabled
                  ? 'opacity-50 cursor-not-allowed bg-muted/30'
                  : 'hover:shadow-sm',
                isSelected
                  ? 'border-muted-foreground bg-muted shadow-sm'
                  : 'border-border hover:border-muted-foreground/50'
              )}
              onClick={() => !isBnbDisabled && handleServiceChange(service.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-md flex-shrink-0',
                    isSelected ? service.bgColor : 'bg-muted/30'
                  )}
                >
                  <Icon
                    className={cn('h-5 w-5', isSelected ? service.color : 'text-muted-foreground')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{service.title}</h3>
                    {isSelected && !isBnbDisabled && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    {isBnbDisabled && (
                      <Badge variant="secondary" className="text-xs">
                        Maks 100 m²
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {service.description}
                  </p>
                  {isBnbDisabled && (
                    <p className="text-xs text-orange-600 mt-1">
                      Kun tilgjengelig for eiendommer opp til 100 m²
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
