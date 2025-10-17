'use client';

import GoogleMapsAddress from '@/components/ui/GoogleMapsAddress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building2, CalendarIcon, Clock, CreditCard, Home, MapPin, User, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface JobDetailsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onRequestJob?: () => void;
  showRequestButton?: boolean;
}

export default function JobDetailsModal({
  job,
  isOpen,
  onClose,
  onRequestJob,
  showRequestButton = true,
}: JobDetailsModalProps) {
  const t = useTranslations('dashboard');

  if (!job) return null;

  const serviceOptions = {
    'bnb-cleaning': t('jobs.services.bnb'),
    'deep-cleaning': t('jobs.services.deep'),
    'move-out-cleaning': t('jobs.services.moveOut'),
  } as const;

  const formatTime = (timeString: string | null) => {
    if (!timeString) return t('jobs.list.time.flexible');
    return timeString;
  };

  const cleanerEarning =
    job.cleanerPayout || Math.round((job.totalPrice || job.price) * 0.8 * 100) / 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {job.property?.name || t('jobs.list.propertyFallback')}
          </DialogTitle>
          <DialogDescription>{t('jobDetails.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('jobDetails.property.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('jobDetails.property.address')}
                </span>
                <GoogleMapsAddress
                  address={job.property?.address || ''}
                  city={job.property?.city}
                  variant="button"
                />
              </div>
              {job.property?.size && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('jobDetails.property.size')}
                  </span>
                  <span className="font-medium">{job.property.size} m²</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('jobDetails.property.type')}
                </span>
                <span className="font-medium">
                  {job.property?.type || t('jobDetails.property.notSpecified')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('jobDetails.job.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('jobDetails.job.service')}</span>
                <Badge variant="secondary">
                  {serviceOptions[job.serviceType as keyof typeof serviceOptions] ||
                    job.serviceType}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('jobDetails.job.date')}</span>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">{job.scheduledDate}</span>
                </div>
              </div>
              {job.scheduledTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('jobDetails.job.time')}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{formatTime(job.scheduledTime)}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('jobDetails.job.status')}</span>
                <Badge variant="outline">
                  {job.status === 'in-progress'
                    ? t('jobs.status.inProgress')
                    : t(`jobs.status.${job.status}` as any)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('jobDetails.payment.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('jobDetails.payment.totalPrice')}
                </span>
                <span className="font-medium">{job.totalPrice || job.price} NOK</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium">{t('jobDetails.payment.yourEarning')}</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600 text-lg">{cleanerEarning} NOK</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Landlord Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('jobDetails.landlord.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('jobDetails.landlord.type')}
                </span>
                <div className="flex items-center gap-2">
                  {job.landlord?.landlordType === 'company' ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {job.landlord?.landlordType || t('jobs.list.landlord.private')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {job.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('jobs.list.specialInstructions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{job.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              {t('jobDetails.close')}
            </Button>
            {showRequestButton && onRequestJob && (
              <Button onClick={onRequestJob} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {t('jobs.list.actions.request')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
