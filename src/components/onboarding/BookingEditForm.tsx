'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from 'convex/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import DateTimeSelector from './DateTimeSelector';
import ServiceTypeSelector from './ServiceTypeSelector';

interface BookingEditFormProps {
  booking: {
    _id: Id<'cleaningJobs'>;
    serviceType: 'bnb-cleaning' | 'deep-cleaning' | 'move-out-cleaning';
    scheduledDate: string;
    scheduledTime: string | null;
    specialInstructions: string | null;
    totalPrice: number;
    pricePerDate: number;
    platformFee: number;
    cleanerPayout: number;
  };
  landlordId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingEditForm({
  booking,
  landlordId,
  onSuccess,
  onCancel,
}: BookingEditFormProps) {
  const t = useTranslations('dashboard.bookings');
  const updateJob = useMutation(api.cleaningJobs.updateCleaningJob);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [serviceType, setServiceType] = useState(booking.serviceType);
  const [scheduledDate, setScheduledDate] = useState(booking.scheduledDate);
  const [scheduledTimeRange, setScheduledTimeRange] = useState(booking.scheduledTime || 'flexible');
  const [specialInstructions, setSpecialInstructions] = useState(booking.specialInstructions || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateJob({
        jobId: booking._id,
        landlordId,
        serviceType,
        scheduledDate,
        scheduledTime: scheduledTimeRange === 'flexible' ? null : scheduledTimeRange,
        specialInstructions: specialInstructions.trim() || null,
        // Keep existing pricing for now - could be recalculated if needed
        totalPrice: booking.totalPrice,
        pricePerDate: booking.pricePerDate,
        platformFee: booking.platformFee,
        cleanerPayout: booking.cleanerPayout,
      });

      onSuccess();
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('edit.title')}</CardTitle>
        <CardDescription>{t('edit.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-sm font-medium">
              {t('serviceType.label')} <span className="text-red-500">*</span>
            </Label>
            <ServiceTypeSelector
              value={serviceType}
              onChange={(service) => setServiceType(service as any)}
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('dateTime.label')} <span className="text-red-500">*</span>
            </Label>
            <DateTimeSelector
              selectedDate={scheduledDate}
              onDateChange={setScheduledDate}
              selectedTimeRange={scheduledTimeRange}
              onTimeRangeChange={setScheduledTimeRange}
            />
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="text-sm font-medium">
              {t('specialInstructions.label')}
            </Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={t('specialInstructions.placeholder')}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Price Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('priceDisplay.totalPrice')}</span>
              <span className="text-lg font-bold">{booking.totalPrice} NOK</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('edit.saving') : t('edit.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('edit.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
