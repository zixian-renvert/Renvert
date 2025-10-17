'use client';

import GoogleMapsAddress from '@/components/ui/GoogleMapsAddress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery } from 'convex/react';
import { CalendarIcon, Clock, CreditCard, Home, MapPin, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import JobDetailsModal from './JobDetailsModal';

interface AvailableJobsListProps {
  cleanerId: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AvailableJobsList({ cleanerId }: AvailableJobsListProps) {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const t = useTranslations('dashboard');
  const locale = useLocale();

  // Only pass a valid service type to the query; otherwise omit it
  const validServiceTypes = ['bnb-cleaning', 'deep-cleaning', 'move-out-cleaning'] as const;
  const serviceTypeFilter = (validServiceTypes as readonly string[]).includes(selectedService)
    ? (selectedService as any)
    : undefined;

  const availableJobs = useQuery(api.cleaningJobs.getAvailableCleaningJobs, {
    serviceType: serviceTypeFilter,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    cleanerId: cleanerId, // Pass cleaner ID to check request status
  });

  const requestJob = useMutation(api.cleanerRequests.requestJob);

  if (!availableJobs) {
    return <div>{t('jobs.list.loading')}</div>;
  }

  const serviceOptions = {
    'bnb-cleaning': t('jobs.services.bnb'),
    'deep-cleaning': t('jobs.services.deep'),
    'move-out-cleaning': t('jobs.services.moveOut'),
  } as const;

  const _formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return t('jobs.list.time.flexible');
    return timeString;
  };

  const handleRequestJob = async (jobId: string) => {
    try {
      await requestJob({
        jobId: jobId as any,
        cleanerId,
        message: '', // Could add a message input later
      });
      alert(t('jobs.list.actions.requestSuccess'));
    } catch (error) {
      console.error('Error requesting job:', error);
      alert(t('jobs.list.actions.requestError'));
    }
  };

  const filteredJobs = availableJobs.filter((job) => {
    if (selectedService !== 'all' && job.serviceType !== selectedService) return false;
    if (selectedCity !== 'all' && job.property?.city?.toLowerCase() !== selectedCity.toLowerCase())
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('jobs.list.heading')}</h3>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('jobs.list.filters.servicesAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('jobs.list.filters.servicesAll')}</SelectItem>
              {Object.entries(serviceOptions).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('jobs.list.filters.citiesAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('jobs.list.filters.citiesAll')}</SelectItem>
              {Array.from(
                new Set(availableJobs.map((job) => job.property?.city).filter(Boolean))
              ).map((city) => (
                <SelectItem key={city} value={city!}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('jobs.list.empty.title')}</CardTitle>
            <CardDescription>
              {selectedService !== 'all' || selectedCity !== 'all'
                ? t('jobs.list.empty.descFiltered')
                : t('jobs.list.empty.desc')}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {job.property?.name || t('jobs.list.propertyFallback')}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <GoogleMapsAddress
                          address={job.property?.address || ''}
                          city={job.property?.city || undefined}
                          className="text-sm text-muted-foreground hover:text-primary"
                        />
                        {job.property?.city && <Badge variant="outline">{job.property.city}</Badge>}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                      {job.status === 'in-progress'
                        ? t('jobs.status.inProgress')
                        : t(`jobs.status.${job.status}` as any)}
                    </Badge>
                    <div className="mt-1">
                      <Badge variant="secondary">
                        {serviceOptions[job.serviceType as keyof typeof serviceOptions] ||
                          job.serviceType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {job.scheduledDate || t('jobs.list.date.notSet')}
                      </div>
                      {job.scheduledTime && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(job.scheduledTime)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>
                        {job.cleanerPayout ||
                          Math.round((job.totalPrice || job.price) * 0.8 * 100) / 100}{' '}
                        NOK {t('jobs.list.cleanerEarning')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{job.landlord?.landlordType || t('jobs.list.landlord.private')}</span>
                    </div>
                  </div>
                </div>

                {job.specialInstructions && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">{t('jobs.list.specialInstructions')}:</span>
                      <br />
                      {job.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {job.cleanerRequest ? (
                    // Show request status if cleaner has requested this job
                    <Button
                      disabled
                      variant="outline"
                      className="bg-yellow-50 border-yellow-200 text-yellow-700"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {job.cleanerRequest.status === 'pending'
                        ? t('jobs.list.actions.requestPending')
                        : job.cleanerRequest.status === 'declined'
                          ? t('jobs.list.actions.requestDeclined')
                          : t('jobs.list.actions.requestAccepted')}
                    </Button>
                  ) : (
                    // Show request button if cleaner hasn't requested yet
                    <Button
                      onClick={() => handleRequestJob(job._id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {t('jobs.list.actions.request')}
                    </Button>
                  )}

                  <Button variant="outline" size="sm" onClick={() => setSelectedJobForDetails(job)}>
                    {t('jobs.list.actions.details')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJobForDetails}
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onRequestJob={() => {
          if (selectedJobForDetails) {
            handleRequestJob(selectedJobForDetails._id);
            setSelectedJobForDetails(null);
          }
        }}
        showRequestButton={true}
      />
    </div>
  );
}
