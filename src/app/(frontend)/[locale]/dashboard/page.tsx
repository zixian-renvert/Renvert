'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../../../../../convex/_generated/api';

import { ActiveJobsCard, ConnectPayoutsCard, PayoutSummaryCard } from '@/components/cleaner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Calendar, CheckCircle, Home, Plus, Settings } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';

// Disable static generation for this page since it uses Convex
export const dynamic = 'force-dynamic';

// Dynamically import components to avoid SSR issues
const BookingForm = dynamicImport(() => import('@/components/onboarding/BookingForm'), { ssr: false });
const BookingsList = dynamicImport(() => import('@/components/onboarding/BookingsList'), { ssr: false });
const AvailableJobsList = dynamicImport(() => import('@/components/onboarding/AvailableJobsList'), {
  ssr: false,
});
const PropertiesList = dynamicImport(() => import('@/components/onboarding/PropertiesList'), {
  ssr: false,
});
const PropertyEditForm = dynamicImport(() => import('@/components/onboarding/PropertyEditForm'), {
  ssr: false,
});

export default function DashboardPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const _locale = useLocale();
  const _router = useRouter();
  const handleExport = async (uid: string) => {
    const res = await fetch('/api/gdpr/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    });
    if (!res.ok) throw new Error('Export failed');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renvert-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (uid: string) => {
    const confirmed = window.confirm('This will permanently delete your data. Continue?');
    if (!confirmed) return;
    const res = await fetch('/api/gdpr/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, reason: 'User-initiated from dashboard' }),
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {}
    if (!res.ok || data?.success === false) {
      const msg = data?.error || res.statusText || 'Deletion failed';
      const details = data?.details ? `\nDetails: ${data.details}` : '';
      alert(`Deletion request failed: ${msg}${details}`);
      return;
    }
    alert('Your deletion request has been received. We will process it within 30 days.');
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const t = useTranslations('dashboard');

  // Handle URL hash for tab navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (
      hash &&
      ['overview', 'bookings', 'jobs', 'properties', 'payouts', 'settings'].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      window.history.replaceState(null, '', `#${activeTab}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [activeTab]);

  const dbUsers = useQuery(api.users.getUsers, isSignedIn ? {} : 'skip');
  const dbUser = dbUsers?.find((user) => user.userId === userId);
  const _cleaner = useQuery(api.cleaners.getCleanerByUserId, userId ? { userId } : 'skip');
  const landlord = useQuery(api.users.getUserLandlord, userId ? { userId } : 'skip');
  const properties = useQuery(api.users.getUserProperties, userId ? { userId } : 'skip');
  
  // Get cleaner's assigned jobs to calculate completed jobs count
  const assignedJobs = useQuery(
    api.cleaningJobs.getCleanerAssignedJobs, 
    userId && dbUser?.userType === 'cleaner' ? { cleanerId: userId } : 'skip'
  );
  const completedJobsCount = assignedJobs?.filter((job) => job.status === 'completed').length || 0;

  // Show loading only if we're signed in but don't have user data yet
  if (isSignedIn && !dbUser) {
    return <div>Loading...</div>;
  }

  // If not signed in, don't render anything (auth will handle redirect)
  if (!isSignedIn) {
    return null;
  }

  const isLandlord = dbUser?.userType === 'landlord';
  const isCleaner = dbUser?.userType === 'cleaner';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile selector */}
          <div className="sm:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              aria-label="Section"
            >
              <option value="overview">{t('tabs.overview')}</option>
              {isLandlord && <option value="bookings">{t('tabs.bookings')}</option>}
              {isCleaner && <option value="jobs">{t('tabs.jobs')}</option>}
              {isCleaner && <option value="payouts">{t('tabs.payouts')}</option>}
              {isLandlord && <option value="properties">{t('tabs.properties')}</option>}
              <option value="settings">{t('tabs.settings')}</option>
            </select>
          </div>

          <TabsList className="hidden sm:flex sm:flex-wrap sm:gap-2 md:sticky md:top-[calc(var(--header-height)+0.5rem)] z-10 bg-transparent p-0 mb-4">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
            >
              <Home className="h-4 w-4" />
              {t('tabs.overview')}
            </TabsTrigger>
            {isLandlord && (
              <TabsTrigger
                value="bookings"
                className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
              >
                <Calendar className="h-4 w-4" />
                {t('tabs.bookings')}
              </TabsTrigger>
            )}
            {isCleaner && (
              <TabsTrigger
                value="jobs"
                className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
              >
                <Briefcase className="h-4 w-4" />
                {t('tabs.jobs')}
              </TabsTrigger>
            )}
            {isCleaner && (
              <TabsTrigger
                value="payouts"
                className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
              >
                <Settings className="h-4 w-4" />
                {t('tabs.payouts')}
              </TabsTrigger>
            )}
            {isLandlord && (
              <TabsTrigger
                value="properties"
                className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
              >
                <Home className="h-4 w-4" />
                {t('tabs.properties')}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 justify-center rounded-md text-sm px-3 py-2 transition text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto sm:flex-1"
            >
              <Settings className="h-4 w-4" />
              {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-3 sm:pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {t('profile.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('profile.name')}</span>
                    <span className="font-medium">{dbUser?.name || t('profile.not_provided')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('profile.email')}</span>
                    <span className="font-medium">{dbUser?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('profile.role')}</span>
                    <span className="font-medium">
                      {dbUser?.userType
                        ? t(`profile.roles.${dbUser.userType}` as any)
                        : t('profile.not_provided')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('profile.status')}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-green-200">
                      <CheckCircle className="h-3.5 w-3.5" /> {t('profile.status_active')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Properties/Jobs Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isLandlord ? <Home className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                    {isLandlord ? t('summary.properties_title') : t('summary.jobs_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {isLandlord ? properties?.length || 0 : completedJobsCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isLandlord ? t('summary.total_properties') : t('summary.completed_jobs')}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('quick.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLandlord && (
                    <Button
                      onClick={() => setActiveTab('bookings')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('quick.book_service')}
                    </Button>
                  )}
                  {isCleaner && (
                    <Button
                      onClick={() => setActiveTab('jobs')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      {t('quick.view_jobs')}
                    </Button>
                  )}
                  {isCleaner && (
                    <Button
                      onClick={() => setActiveTab('payouts')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('quick.manage_payouts')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Active Jobs and Payout Summary for Cleaners */}
            {isCleaner && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActiveJobsCard cleanerId={userId!} />
                <PayoutSummaryCard cleanerId={userId!} />
              </div>
            )}
          </TabsContent>
          {/* Payouts Tab - Cleaner Only */}
          {isCleaner && (
            <TabsContent value="payouts" className="space-y-6 pt-3 sm:pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">{t('payouts.title')}</h2>
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                  className="self-start sm:self-auto"
                >
                  {t('back_to_overview')}
                </Button>
              </div>

              <ConnectPayoutsCard />
            </TabsContent>
          )}

          {/* Bookings Tab - Landlord Only */}
          {isLandlord && (
            <TabsContent value="bookings" className="space-y-6 pt-3 sm:pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">{t('bookings.title')}</h2>
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                  className="self-start sm:self-auto"
                >
                  {t('back_to_overview')}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('bookings.book_new')}</h3>
                  <BookingForm userId={userId!} landlordId={landlord?._id || ''} />
                </div>

                {/* Existing Bookings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('bookings.existing')}</h3>
                  <BookingsList landlordId={landlord?._id || ''} />
                </div>
              </div>
            </TabsContent>
          )}

          {/* Jobs Tab - Cleaner Only */}
          {isCleaner && (
            <TabsContent value="jobs" className="space-y-6 pt-3 sm:pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">{t('jobs.title')}</h2>
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                  className="self-start sm:self-auto"
                >
                  {t('back_to_overview')}
                </Button>
              </div>

              <AvailableJobsList cleanerId={userId!} />
            </TabsContent>
          )}

          {/* Properties Tab - Landlord Only */}
          {isLandlord && (
            <TabsContent value="properties" className="space-y-6 pt-3 sm:pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">{t('your_properties')}</h2>
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                  className="self-start sm:self-auto"
                >
                  {t('back_to_overview')}
                </Button>
              </div>

              {editingProperty ? (
                // Show edit form
                <PropertyEditForm
                  property={editingProperty}
                  onSuccess={() => {
                    setEditingProperty(null);
                    // Refresh properties data
                  }}
                  onCancel={() => setEditingProperty(null)}
                />
              ) : (
                // Show properties list
                <PropertiesList
                  properties={properties || []}
                  userId={userId!}
                  onEditProperty={(propertyId: string) => {
                    const property = properties?.find((p) => p._id === propertyId);
                    if (property) {
                      setEditingProperty(property);
                    }
                  }}
                />
              )}
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 pt-3 sm:pt-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
              <Button
                onClick={() => setActiveTab('overview')}
                variant="outline"
                className="self-start sm:self-auto"
              >
                {t('back_to_overview')}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.account_info')}</CardTitle>
                <CardDescription>{t('settings.account_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t('profile.email')}</span>
                  <span className="text-muted-foreground">{dbUser?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('settings.member_since')}</span>
                  <span className="text-muted-foreground">
                    {dbUser
                      ? new Date(dbUser.createdAt).toLocaleDateString()
                      : t('settings.loading')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('settings.last_updated')}</span>
                  <span className="text-muted-foreground">
                    {dbUser
                      ? new Date(dbUser.updatedAt).toLocaleDateString()
                      : t('settings.loading')}
                  </span>
                </div>

                {dbUser?.deletionRequested && (
                  <div className="p-3 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    {t('settings.deletion_pending')}
                  </div>
                )}

                {/* GDPR Controls */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('settings.export.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('settings.export.desc')}
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => userId && handleExport(userId)}>
                      {t('settings.export.button')}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('settings.delete.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('settings.delete.desc')}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      disabled={Boolean(dbUser?.deletionRequested)}
                      onClick={() => userId && handleDelete(userId)}
                    >
                      {t('settings.delete.button')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
