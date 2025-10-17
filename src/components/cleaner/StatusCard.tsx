'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { AlertCircle, CheckCircle, Pause, Play, XCircle } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';

const statusConfig = {
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Your account is active and you can receive cleaning requests.',
  },
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    description: 'Your account is under review. This usually takes 1-2 business days.',
  },
  paused: {
    label: 'Paused',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Pause,
    description: "Your account is paused. You won't receive new cleaning requests.",
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Your account has been suspended. Please contact support for assistance.',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Your application was not approved. Please contact support for more information.',
  },
};

export default function StatusCard() {
  const { userId } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const cleaner = useQuery(api.cleaners.getCleanerByUserId, { userId: userId || '' });
  const pauseAccount = useMutation(api.cleaners.pauseCleanerAccount);
  const resumeAccount = useMutation(api.cleaners.resumeCleanerAccount);

  if (!cleaner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Loading your account information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const status = cleaner.status || 'pending';
  const config = statusConfig[status];
  const IconComponent = config.icon;

  const handlePauseAccount = async () => {
    if (!userId) return;

    setIsUpdating(true);
    try {
      await pauseAccount({ userId });
    } catch (error) {
      console.error('Failed to pause account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResumeAccount = async () => {
    if (!userId) return;

    setIsUpdating(true);
    try {
      await resumeAccount({ userId });
    } catch (error) {
      console.error('Failed to resume account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Account Status
        </CardTitle>
        <CardDescription>Manage your cleaning service account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={config.color}>{config.label}</Badge>
          {cleaner.statusReason && (
            <span className="text-sm text-muted-foreground">Reason: {cleaner.statusReason}</span>
          )}
        </div>

        {/* Status Description */}
        <p className="text-sm text-muted-foreground">{config.description}</p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === 'approved' && (
            <Button
              variant="outline"
              onClick={handlePauseAccount}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause Account
            </Button>
          )}

          {status === 'paused' && (
            <Button
              onClick={handleResumeAccount}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Resume Account
            </Button>
          )}
        </div>

        {/* HMS Card Status */}
        {cleaner.hmsCardFileId && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">HMS Card</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>HMS Card uploaded successfully</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">File: HMS Card (Stored in Convex)</p>
            <div className="mt-2">
              <img
                src={`https://storage.convex.cloud/${cleaner.hmsCardFileId}`}
                alt="HMS Card Preview"
                className="w-full h-auto max-h-32 object-contain border rounded"
                onError={(e) => {
                  // Fallback to generic file icon if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Last updated: {new Date(cleaner.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
