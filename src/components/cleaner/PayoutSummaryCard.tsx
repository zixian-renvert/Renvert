'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { api } from '../../../convex/_generated/api';

interface PayoutSummaryCardProps {
  cleanerId: string;
}

export default function PayoutSummaryCard({ cleanerId }: PayoutSummaryCardProps) {
  const t = useTranslations('dashboard');

  // Get all jobs assigned to this cleaner
  const assignedJobs = useQuery(api.cleaningJobs.getCleanerAssignedJobs, { cleanerId });

  const payoutSummary = useMemo(() => {
    if (!assignedJobs) return null;

    // Calculate earnings by status
    const completedJobs = assignedJobs.filter((job) => job.status === 'completed');
    const inProgressJobs = assignedJobs.filter((job) => job.status === 'in-progress');

    // Completed jobs with pending payouts (waiting for Stripe funds)
    const pendingPayouts = completedJobs.filter((job) => job.payoutStatus === 'pending');
    
    // Completed jobs that are paid
    const paidJobs = completedJobs.filter((job) => job.payoutStatus === 'paid');

    // Total pending earnings (waiting for Stripe settlement)
    const pendingAmount = pendingPayouts.reduce((sum, job) => {
      return sum + (job.cleanerPayout || 0);
    }, 0);

    // Total earned (already paid out)
    const totalEarned = paidJobs.reduce((sum, job) => sum + (job.cleanerPayout || 0), 0);

    // Upcoming earnings (jobs in progress)
    const upcomingEarnings = inProgressJobs.reduce((sum, job) => {
      return sum + (job.cleanerPayout || 0);
    }, 0);

    // Calculate estimated payout date (7 days from oldest pending job's completion)
    let estimatedPayoutDate: string | undefined;
    if (pendingPayouts.length > 0) {
      const oldestPending = pendingPayouts.sort((a, b) => 
        (a.completedAt || 0) - (b.completedAt || 0)
      )[0];
      
      if (oldestPending.completedAt) {
        const completedDate = new Date(oldestPending.completedAt);
        const estimatedDate = new Date(completedDate);
        estimatedDate.setDate(estimatedDate.getDate() + 7);
        estimatedPayoutDate = estimatedDate.toLocaleDateString('no-NO', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    }

    return {
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,
      upcomingEarnings: Math.round(upcomingEarnings * 100) / 100,
      completedJobsCount: completedJobs.length,
      paidJobsCount: paidJobs.length,
      pendingPayoutsCount: pendingPayouts.length,
      estimatedPayoutDate,
    };
  }, [assignedJobs]);

  if (!payoutSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('payoutSummary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('payoutSummary.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('payoutSummary.title')}
        </CardTitle>
        <CardDescription>{t('payoutSummary.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Payouts (waiting for Stripe settlement) */}
        {payoutSummary.pendingAmount > 0 && (
          <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-amber-900 mb-1">
                  {t('payoutSummary.pendingTitle')}
                </div>
                <div className="text-sm text-amber-700 mb-2">
                  {payoutSummary.pendingPayoutsCount} {t('payoutSummary.completedJobs')}
                </div>
                {payoutSummary.estimatedPayoutDate && (
                  <div className="text-xs text-amber-600 flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    <span>{t('payoutSummary.estimatedDate')}: {payoutSummary.estimatedPayoutDate}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-900">
                  {payoutSummary.pendingAmount} NOK
                </div>
                <Badge variant="outline" className="mt-1 text-xs bg-white">
                  {t('payoutSummary.processing')}
                </Badge>
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-700 bg-white/50 p-2 rounded">
              ℹ️ {t('payoutSummary.pendingExplanation')}
            </div>
          </div>
        )}

        {/* Upcoming Earnings */}
        {payoutSummary.upcomingEarnings > 0 && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('payoutSummary.upcomingTitle')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('payoutSummary.inProgressJobs')}
                </div>
              </div>
              <div className="text-xl font-semibold text-blue-600">
                {payoutSummary.upcomingEarnings} NOK
              </div>
            </div>
          </div>
        )}

        {/* Total Earned */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t('payoutSummary.totalEarned')}</span>
          </div>
          <div className="font-semibold">{payoutSummary.totalEarned} NOK</div>
        </div>

        {/* Jobs Summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium">{payoutSummary.paidJobsCount}</span> {t('payoutSummary.paidJobs')}
          </div>
          {payoutSummary.pendingPayoutsCount > 0 && (
            <div className="text-amber-600">
              <span className="font-medium">{payoutSummary.pendingPayoutsCount}</span> {t('payoutSummary.pendingJobs')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
