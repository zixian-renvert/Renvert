'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAction, useMutation, useQuery } from 'convex/react';
import { Banknote, CheckCircle2, ExternalLink, Loader2, RefreshCw, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { api } from '../../../convex/_generated/api';

export default function ConnectPayoutsCard() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = useTranslations('dashboard');

  const cleaner = useQuery(api.cleaners.getCleanerByUserId, { userId: userId || '' });
  const createCleaner = useMutation(api.cleaners.createCleanerIfMissing);
  const setConnectAccount = useMutation(api.stripeConnect.setConnectAccount);
  const connectStatus = useQuery(
    api.stripeConnect.getConnectAccountStatus,
    cleaner?._id ? { cleanerId: cleaner._id } : 'skip'
  );

  const status = connectStatus?.connectAccountStatus || 'pending';
  const hasAccount = Boolean(connectStatus?.connectAccountId);
  const bankInfo = connectStatus?.bankAccountDetails || null;

  const canPayout = useMemo(() => status === 'active', [status]);

  const handleRefreshStatus = async () => {
    if (!connectStatus?.connectAccountId) return;

    setIsRefreshing(true);
    try {
      // Call Stripe API to get current account status
      const response = await fetch('/api/stripe/connect/refresh-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: connectStatus.connectAccountId }),
      });

      if (response.ok) {
        alert(t('payouts.card.refreshSuccess'));
        // Force re-query by refreshing the page
        window.location.reload();
      } else {
        throw new Error('Failed to refresh status');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      alert(t('payouts.card.refreshError'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSetupOrContinue = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      let ensuredCleanerId = cleaner?._id as any;
      if (!ensuredCleanerId) {
        ensuredCleanerId = await createCleaner({ userId });
      }
      
      const accountId = connectStatus?.connectAccountId;
      let stripeAccountId = accountId;

      // Create Stripe Connect account if it doesn't exist
      if (!accountId) {
        const email = user?.primaryEmailAddress?.emailAddress || `user-${userId}@renvert.local`;
        
        const createResponse = await fetch('/api/stripe/connect/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            country: 'NO',
            type: 'express',
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.details || error.error || 'Failed to create Connect account');
        }

        const { accountId: newAccountId, accountStatus } = await createResponse.json();
        stripeAccountId = newAccountId;

        // Update cleaner with Connect account info using mutation
        await setConnectAccount({
          cleanerId: ensuredCleanerId,
          accountId: newAccountId,
          accountStatus: accountStatus === 'active' ? 'active' : 'pending',
        });
      }

      // Get onboarding link
      const onboardResponse = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          returnUrl: window.location.href,
        }),
      });

      if (!onboardResponse.ok) {
        const error = await onboardResponse.json();
        throw new Error(error.error || 'Failed to create onboarding link');
      }

      const { accountLink } = await onboardResponse.json();
      window.location.href = accountLink;
    } catch (err) {
      console.error('Connect onboarding error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to start onboarding: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          {t('payouts.card.title')}
        </CardTitle>
        <CardDescription>{t('payouts.card.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('payouts.card.secure')}
          </div>
        </div>

        {bankInfo ? (
          <div className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('payouts.card.bank_on_file')}</div>
                <div className="text-muted-foreground">
                  {bankInfo.bankName} — **** {bankInfo.last4} ({bankInfo.accountType})
                </div>
              </div>
              {canPayout && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('payouts.card.enabled')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            {t('payouts.card.no_bank')}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSetupOrContinue}
            disabled={isLoading || !userId}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {!hasAccount
              ? t('payouts.card.setup')
              : canPayout
                ? t('payouts.card.manage')
                : t('payouts.card.continue')}
          </Button>

          {hasAccount && (
            <Button
              variant="outline"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t('payouts.card.refresh')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
