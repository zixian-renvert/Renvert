'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery } from 'convex/react';
import { Building2, CheckCircle, Clock, MapPin, Star, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';

interface CleanerSelectionCardProps {
  jobId: string;
  onCleanerSelected?: () => void;
}

export default function CleanerSelectionCard({
  jobId,
  onCleanerSelected,
}: CleanerSelectionCardProps) {
  const t = useTranslations('dashboard');
  const [selecting, setSelecting] = useState<string | null>(null);

  // Get requests for this job
  const requests = useQuery(api.cleanerRequests.getJobRequests, { jobId: jobId as any });
  const acceptRequest = useMutation(api.cleanerRequests.acceptCleanerRequest);

  const handleSelectCleaner = async (requestId: string) => {
    try {
      setSelecting(requestId);
      await acceptRequest({
        requestId: requestId as any,
        jobId: jobId as any,
      });

      alert(t('cleanerSelection.selectSuccess'));
      onCleanerSelected?.();
    } catch (error) {
      console.error('Error selecting cleaner:', error);
      alert(t('cleanerSelection.selectError'));
    } finally {
      setSelecting(null);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('cleanerSelection.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('cleanerSelection.noRequests')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('cleanerSelection.title')}
        </CardTitle>
        <CardDescription>
          {t('cleanerSelection.description', { count: requests.length })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="border rounded-lg p-4 space-y-3">
            {/* Cleaner Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">
                    {request.user?.name || t('cleanerSelection.anonymous')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(request.requestedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Company Information */}
            {request.company && (
              <div className="bg-muted/50 border border-muted-foreground/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4  mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium ">{request.company.name}</div>
                    {request.company.businessAddress && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {request.company.businessAddress.city},{' '}
                          {request.company.businessAddress.postalCode}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('cleanerSelection.orgNumber')}: {request.company.organizationNumber}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cleaner Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {request.stats.completedJobs} {t('cleanerSelection.completedJobs')}
                </span>
              </div>
              {request.stats.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>
                    {request.stats.averageRating} {t('cleanerSelection.rating')}
                  </span>
                </div>
              )}
              {request.stats.completedJobs === 0 && (
                <Badge variant="secondary">{t('cleanerSelection.newCleaner')}</Badge>
              )}
            </div>

            {/* Cleaner Message */}
            {request.message && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">
                  <span className="font-medium">{t('cleanerSelection.message')}:</span>
                  <br />
                  {request.message}
                </p>
              </div>
            )}

            {/* Select Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSelectCleaner(request._id)}
                disabled={selecting === request._id}
                className="bg-green-600 hover:bg-green-700"
              >
                {selecting === request._id ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {t('cleanerSelection.selecting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('cleanerSelection.selectCleaner')}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
