'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface JobCompleteModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmComplete: () => void;
  isCompleting: boolean;
}

export default function JobCompleteModal({
  job,
  isOpen,
  onClose,
  onConfirmComplete,
  isCompleting,
}: JobCompleteModalProps) {
  const t = useTranslations('dashboard');
  const [confirmations, setConfirmations] = useState({
    allTasksCompleted: false,
    instructionsFollowed: false,
    areaClean: false,
  });

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleConfirmationChange = (key: keyof typeof confirmations, checked: boolean) => {
    setConfirmations((prev) => ({ ...prev, [key]: checked }));
  };

  const handleComplete = () => {
    if (allConfirmed) {
      onConfirmComplete();
      // Reset confirmations for next time
      setConfirmations({
        allTasksCompleted: false,
        instructionsFollowed: false,
        areaClean: false,
      });
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('jobComplete.title')}
          </DialogTitle>
          <DialogDescription>{t('jobComplete.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{job.property?.name}</CardTitle>
              <CardDescription>{job.property?.address}</CardDescription>
            </CardHeader>
          </Card>

          {/* Special Instructions Review */}
          {job.specialInstructions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('jobComplete.instructionsReview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted/50 rounded p-3">{job.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Completion Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('jobComplete.checklist.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="tasks-completed"
                  checked={confirmations.allTasksCompleted}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange('allTasksCompleted', checked as boolean)
                  }
                />
                <label htmlFor="tasks-completed" className="text-sm leading-relaxed">
                  {t('jobComplete.checklist.allTasks')}
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="instructions-followed"
                  checked={confirmations.instructionsFollowed}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange('instructionsFollowed', checked as boolean)
                  }
                />
                <label htmlFor="instructions-followed" className="text-sm leading-relaxed">
                  {t('jobComplete.checklist.instructions')}
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="area-clean"
                  checked={confirmations.areaClean}
                  onCheckedChange={(checked) =>
                    handleConfirmationChange('areaClean', checked as boolean)
                  }
                />
                <label htmlFor="area-clean" className="text-sm leading-relaxed">
                  {t('jobComplete.checklist.clean')}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">
                  {t('jobComplete.support.title')}
                </div>
                <div className="text-blue-700">
                  {t('jobComplete.support.description')}
                  <a href="mailto:support@renvert.no" className="underline font-medium">
                    support@renvert.no
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isCompleting}>
              {t('jobComplete.cancel')}
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1"
              disabled={!allConfirmed || isCompleting}
            >
              {isCompleting ? t('jobComplete.completing') : t('jobComplete.confirmComplete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
