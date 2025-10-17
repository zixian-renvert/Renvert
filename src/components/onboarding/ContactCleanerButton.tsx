'use client';

import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '../../../convex/_generated/api';

interface ContactCleanerButtonProps {
  cleanerId: string;
  className?: string;
}

export default function ContactCleanerButton({ cleanerId, className }: ContactCleanerButtonProps) {
  const t = useTranslations('dashboard');
  const cleanerUser = useQuery(api.users.getUserByUserId, { userId: cleanerId });

  const handleContact = () => {
    if (cleanerUser?.phone) {
      // Open phone dialer
      window.location.href = `tel:${cleanerUser.phone}`;
    } else {
      alert(t('bookings.contactUnavailable'));
    }
  };

  if (!cleanerUser) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Phone className="h-4 w-4 mr-2" />
        {t('bookings.loadingContact')}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleContact} className={className}>
      <Phone className="h-4 w-4 mr-2" />
      {cleanerUser.name ? (
        <>
          {t('bookings.contact')} {cleanerUser.name}
          {cleanerUser.phone && (
            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">{cleanerUser.phone}</span>
          )}
        </>
      ) : (
        t('bookings.contactCleaner')
      )}
    </Button>
  );
}
