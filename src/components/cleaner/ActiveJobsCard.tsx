'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useAction } from 'convex/react';
import { Briefcase, CalendarIcon, Clock, Home, Play, Square, MapPin, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import JobCompleteModal from './JobCompleteModal';
import JobStartModal from './JobStartModal';

interface ActiveJobsCardProps {
  cleanerId: string;
}

interface CleaningJobListItemProperty {
  name?: string | null;
  address?: string | null;
  city?: string | null;
}

type CleaningJobStatus =
  | 'pending'
  | 'requested'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

interface CleaningJobListItem {
  _id: string;
  status: CleaningJobStatus;
  scheduledDate: string;
  scheduledTime?: string | null;
  property?: CleaningJobListItemProperty | null;
  paymentStatus?: 'pending' | 'authorized' | 'paid' | 'refunded' | 'failed';
  payoutStatus?: 'pending' | 'paid' | 'failed';
  cleanerPayout?: number;
}

export default function ActiveJobsCard({ cleanerId }: ActiveJobsCardProps) {
  const t = useTranslations('dashboard');
  const [startingJob, setStartingJob] = useState<CleaningJobListItem | null>(null);
  const [completingJob, setCompletingJob] = useState<CleaningJobListItem | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Get assigned jobs for this cleaner
  const assignedJobs = useQuery(api.cleaningJobs.getCleanerAssignedJobs, { cleanerId });

  // Actions - use actions to trigger payment capture and payouts
  const startJob = useAction(api.cleaningJobs.startJobAndCapturePayment);
  const completeJob = useAction(api.cleaningJobs.completeJobAndPayout);

  // Filter for active jobs (confirmed or in-progress)
  const activeJobs: CleaningJobListItem[] =
    assignedJobs?.filter(
      (job: CleaningJobListItem) => job.status === 'confirmed' || job.status === 'in-progress'
    ) || [];

  const handleStartJob = async () => {
    if (!startingJob) return;

    try {
      setIsStarting(true);

      // Start the job and capture payment
      const result = await startJob({
        jobId: startingJob._id as any,
        cleanerId,
      });

      if (result.success) {
        if (result.captureError) {
          // Job started but payment capture failed
          console.error('Payment capture error:', result.captureError);
          alert(`Job started but payment capture failed: ${result.captureError}. Please contact support.`);
        } else {
          // Job started and payment captured successfully
          alert(t('activeJobs.startSuccess'));
        }
        setStartingJob(null);
      } else {
        throw new Error(result.error || 'Failed to start job');
      }
    } catch (error) {
      console.error('Error starting job:', error);
      alert(t('activeJobs.startError'));
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!completingJob) return;

    try {
      setIsCompleting(true);

      // Complete the job and trigger payout
      const result = await completeJob({
        jobId: completingJob._id as any,
        cleanerId,
      });

      if (result?.success) {
        if (result.payoutError) {
          // Job completed but payout failed
          console.error('Payout error:', result.payoutError);
          
          // Check if it's an insufficient funds error
          if (result.payoutError.includes('INSUFFICIENT_FUNDS')) {
            alert(t('activeJobs.completeSuccessPayoutPending'));
          } else {
            alert(`${t('activeJobs.completeSuccess')} but payout failed: ${result.payoutError}. Please contact support.`);
          }
        } else if (result.payoutId) {
          // Job completed and payout successful
          alert(`${t('activeJobs.completeSuccess')} Payment will be transferred to your account.`);
        } else {
          // Job completed
          alert(t('activeJobs.completeSuccess'));
        }
        setCompletingJob(null);
      } else {
        throw new Error(result.error || 'Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert(t('activeJobs.completeError'));
    } finally {
      setIsCompleting(false);
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  if (activeJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('activeJobs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('activeJobs.noActiveJobs')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {t('activeJobs.title')}
        </CardTitle>
        <CardDescription>{t('activeJobs.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeJobs.map((job: CleaningJobListItem) => (
          <div key={job._id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h4 className="font-medium truncate">
                    {job.property?.name || t('jobs.list.propertyFallback')}
                  </h4>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const fullAddress = job.property?.city 
                      ? `${job.property.address}, ${job.property.city}` 
                      : job.property?.address || '';
                    const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`;
                    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{t('activeJobs.openInMaps')}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                </button>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Badge variant={job.status === 'confirmed' ? 'secondary' : 'default'}>
                  {job.status === 'in-progress'
                    ? t('jobs.status.inProgress')
                    : t(`jobs.status.${job.status}` as any)}
                </Badge>
                {job.paymentStatus && (
                  <Badge 
                    variant={
                      job.paymentStatus === 'paid' ? 'default' : 
                      job.paymentStatus === 'failed' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-xs whitespace-nowrap"
                  >
                    {t('activeJobs.paymentLabel')}: {t(`activeJobs.paymentStatusLabels.${job.paymentStatus}` as any)}
                  </Badge>
                )}
                {job.status === 'completed' && job.payoutStatus && (
                  <Badge 
                    variant={
                      job.payoutStatus === 'paid' ? 'default' : 
                      job.payoutStatus === 'failed' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-xs whitespace-nowrap"
                  >
                    💰 {t('activeJobs.payoutLabel')}: {t(`activeJobs.payoutStatusLabels.${job.payoutStatus}` as any)}
                    {job.payoutStatus === 'paid' && job.cleanerPayout && (
                      <span className="ml-1">({job.cleanerPayout} NOK)</span>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {job.scheduledDate}
              </div>
              {job.scheduledTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.scheduledTime}
                </div>
              )}
            </div>

            {/* Action buttons based on job status */}
            <div className="flex gap-2">
              {job.status === 'confirmed' && isToday(job.scheduledDate) && (
                <Button onClick={() => setStartingJob(job)} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  {t('activeJobs.startJob')}
                </Button>
              )}

              {job.status === 'confirmed' && !isToday(job.scheduledDate) && (
                <Button disabled variant="outline" className="flex-1">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {t('activeJobs.scheduledFor')} {job.scheduledDate}
                </Button>
              )}

              {job.status === 'in-progress' && (
                <Button onClick={() => setCompletingJob(job)} className="flex-1" variant="default">
                  <Square className="h-4 w-4 mr-2" />
                  {t('activeJobs.completeJob')}
                </Button>
              )}
            </div>

            {/* Payment status warning */}
            {job.paymentStatus && job.paymentStatus !== 'paid' && job.status === 'in-progress' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Payment not captured. Please contact support if this persists.
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Modals */}
        <JobStartModal
          job={startingJob}
          isOpen={!!startingJob}
          onClose={() => setStartingJob(null)}
          onConfirmStart={handleStartJob}
          isStarting={isStarting}
        />

        <JobCompleteModal
          job={completingJob}
          isOpen={!!completingJob}
          onClose={() => setCompletingJob(null)}
          onConfirmComplete={handleCompleteJob}
          isCompleting={isCompleting}
        />
      </CardContent>
    </Card>
  );
}
