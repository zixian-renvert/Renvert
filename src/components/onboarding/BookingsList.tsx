'use client';

import GoogleMapsAddress from '@/components/ui/GoogleMapsAddress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery } from 'convex/react';
import { CalendarIcon, Clock, CreditCard, Edit, Home, MapPin, Phone, User, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import BookingEditForm from './BookingEditForm';
import CleanerSelectionCard from './CleanerSelectionCard';
import ContactCleanerButton from './ContactCleanerButton';

interface BookingsListProps {
  landlordId: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  requested: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function BookingsList({ landlordId }: BookingsListProps) {
  const t = useTranslations('dashboard.bookings');
  const bookings = useQuery(api.cleaningJobs.getLandlordCleaningJobs, { landlordId });
  const cancelJob = useMutation(api.cleaningJobs.cancelCleaningJob);

  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  if (!bookings) {
    return <div>{t('loading')}</div>;
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noBookings.title')}</CardTitle>
          <CardDescription>{t('noBookings.description')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleCancelBooking = async (jobId: string) => {
    if (!confirm(t('cancel.confirm'))) return;

    setIsCancelling(jobId);
    try {
      await cancelJob({ jobId: jobId as any, landlordId });
      // The query will automatically refresh
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(t('cancel.error'));
    } finally {
      setIsCancelling(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingBookingId(null);
    // The query will automatically refresh
  };

  const handleBookAgain = () => {
    // Scroll to the top of the bookings tab where the booking form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Flexible';
    return timeString;
  };

  // Separate active and completed bookings
  const activeBookings = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('activeBookings')}</h3>
          {activeBookings.map((booking) => {
        // Show edit form if this booking is being edited
        if (editingBookingId === booking._id) {
          return (
            <BookingEditForm
              key={booking._id}
              booking={{
                _id: booking._id,
                serviceType: booking.serviceType,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                specialInstructions: booking.specialInstructions,
                totalPrice: booking.totalPrice || 0,
                pricePerDate: booking.pricePerDate || 0,
                platformFee: booking.platformFee || 0,
                cleanerPayout: booking.cleanerPayout || 0,
              }}
              landlordId={landlordId}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingBookingId(null)}
            />
          );
        }

        return (
          <Card key={booking._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">
                      {booking.property?.name || t('propertyFallback')}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <GoogleMapsAddress
                        address={booking.property?.address || ''}
                        city={booking.property?.city || undefined}
                        className="text-sm text-muted-foreground hover:text-primary"
                      />
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                    {t(`status.${booking.status}` as any)}
                  </Badge>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={
                        paymentStatusColors[
                          booking.paymentStatus as keyof typeof paymentStatusColors
                        ]
                      }
                    >
                      {t(`paymentStatus.${booking.paymentStatus}` as any)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('labels.date')}</span>
                    <span>{formatDate(booking.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('labels.time')}</span>
                    <span>{formatTime(booking.scheduledTime)}</span>
                  </div>

                  {/* Duration field not implemented yet */}
                  {/* {booking.estimatedDuration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Duration:</span>
                    <span>{booking.estimatedDuration} hours</span>
                  </div>
                )} */}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{t('labels.service')}</span>
                    <Badge variant="secondary">
                      {booking.serviceType.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('labels.price')}</span>
                    <span className="font-semibold">{booking.totalPrice || booking.price} NOK</span>
                  </div>

                  {booking.assignedCleanerId && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t('labels.cleaner')}</span>
                      <span>Assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {booking.specialInstructions && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{t('labels.specialInstructions')}</span>
                    <br />
                    {booking.specialInstructions}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {(booking.status === 'pending' || booking.status === 'requested') &&
                  !booking.assignedCleanerId && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBookingId(booking._id)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {t('actions.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex items-center gap-2"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={isCancelling === booking._id}
                      >
                        <X className="h-4 w-4" />
                        {isCancelling === booking._id
                          ? t('actions.cancelling')
                          : t('actions.cancel')}
                      </Button>
                    </>
                  )}

                {(booking.status === 'confirmed' || booking.status === 'in-progress') &&
                  booking.assignedCleanerId && (
                    <ContactCleanerButton
                      cleanerId={booking.assignedCleanerId}
                      className="text-sm"
                    />
                  )}

                {booking.status === 'completed' && (
                  <Button variant="outline" size="sm" onClick={handleBookAgain}>
                    {t('actions.bookAgain')}
                  </Button>
                )}
              </div>

              {/* Show cleaner selection for jobs with requests */}
              {booking.status === 'requested' && (
                <div className="mt-4 border-t pt-4">
                  <CleanerSelectionCard
                    jobId={booking._id}
                    onCleanerSelected={() => {
                      // Refresh the bookings list
                      window.location.reload();
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
        </div>
      )}

      {/* Completed Bookings */}
      {completedBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('completedBookings')}</h3>
          {completedBookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-medium truncate">
                        {booking.property?.name || t('propertyFallback')}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(booking.scheduledDate)}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {booking.serviceType.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span className="font-semibold">{booking.totalPrice || booking.price} NOK</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <Badge className={statusColors.completed}>
                      {t('status.completed')}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleBookAgain}>
                      {t('actions.bookAgain')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
