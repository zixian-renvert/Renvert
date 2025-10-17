'use client';

import GoogleMapsAddress from '@/components/ui/GoogleMapsAddress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface JobStartModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: () => void;
  isStarting: boolean;
}

export default function JobStartModal({
  job,
  isOpen,
  onClose,
  onConfirmStart,
  isStarting,
}: JobStartModalProps) {
  const t = useTranslations('dashboard');

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('jobStart.title')}
          </DialogTitle>
          <DialogDescription>{t('jobStart.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{job.property?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <GoogleMapsAddress
                address={job.property?.address || ''}
                city={job.property?.city}
                variant="button"
                className="w-full"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {job.scheduledTime || t('jobs.list.time.flexible')}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {job.specialInstructions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t('jobStart.instructions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{job.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm">
              <div className="font-medium text-green-900 mb-2">{t('jobStart.confirm.title')}</div>
              <ul className="space-y-1 text-green-700">
                <li>• {t('jobStart.confirm.arrived')}</li>
                <li>• {t('jobStart.confirm.readInstructions')}</li>
                <li>• {t('jobStart.confirm.readyToStart')}</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isStarting}>
              {t('jobStart.cancel')}
            </Button>
            <Button onClick={onConfirmStart} className="flex-1" disabled={isStarting}>
              {isStarting ? t('jobStart.starting') : t('jobStart.confirmStart')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
