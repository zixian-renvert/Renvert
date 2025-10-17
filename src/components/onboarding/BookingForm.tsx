'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from 'convex/react';
import { CalendarIcon, Clock, CreditCard, Home, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import DateTimeSelector from './DateTimeSelector';
import PaymentInfoCard from './PaymentInfoCard';
import ServiceTypeSelector from './ServiceTypeSelector';
import StripePaymentForm from './StripePaymentForm';

interface Property {
  _id: string;
  name: string;
  address: string;
  city: string | null;
  type: string;
  size: string | null;
}

interface BookingFormProps {
  userId: string;
  landlordId: string;
}

export default function BookingForm({ userId, landlordId }: BookingFormProps) {
  const _t = useTranslations('onboarding');
  const t = useTranslations('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('bnb-cleaning');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTimeRange, setScheduledTimeRange] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Get user's properties
  const properties = useQuery(api.users.getUserProperties, { userId });

  const serviceOptions = {
    'bnb-cleaning': 'BNB Cleaning',
    'deep-cleaning': 'Deep Cleaning',
    'move-out-cleaning': 'Move-out Cleaning',
  };

  const validServiceTypes = Object.keys(serviceOptions);

  // Ensure service type is properly initialized on mount
  useEffect(() => {
    if (
      !selectedService ||
      selectedService === '' ||
      !validServiceTypes.includes(selectedService)
    ) {
      setSelectedService('bnb-cleaning');
    }
  }, []); // Only run on mount

  // Monitor selectedService changes and ensure it's always valid
  useEffect(() => {
    // If service type becomes invalid, reset to default
    if (selectedService && !validServiceTypes.includes(selectedService)) {
      setSelectedService('bnb-cleaning');
    }
  }, [selectedService, validServiceTypes]);

  // Calculate price based on service type and property size
  const servicePricing = useQuery(
    api.servicePricing.calculateServicePriceByProperty,
    selectedService && selectedProperty && properties?.find((p) => p._id === selectedProperty)?.size
      ? {
          serviceType: selectedService as 'bnb-cleaning' | 'deep-cleaning' | 'move-out-cleaning',
          propertySize: properties.find((p) => p._id === selectedProperty)?.size || '',
        }
      : 'skip'
  );

  // Calculate total price and platform fees
  const basePrice = servicePricing?.basePrice || 0;
  const platformFee = servicePricing?.platformFee || 0;
  const cleanerPayout = servicePricing?.cleanerPayout || 0;
  const _pricePerDate = basePrice;
  const _totalPrice = basePrice;
  const _totalPlatformFee = platformFee;
  const _totalCleanerPayout = cleanerPayout;

  // Check if pricing data exists
  const _allServicePricing = useQuery(api.servicePricing.getAllServicePricing, {});

  // Check if the query should be skipped
  const _shouldSkipQuery =
    !selectedService ||
    !selectedProperty ||
    selectedService === '' ||
    !validServiceTypes.includes(selectedService) ||
    !properties?.find((p) => p._id === selectedProperty)?.size;

  // Create cleaning job mutation
  const createCleaningJob = useMutation(api.cleaningJobs.createCleaningJob);
  const markPaymentAuthorized = useMutation(api.cleaningJobs.markPaymentAuthorized);

  // timeSlots removed - now using time ranges in DateTimeSelector

  // Auto-calculate price when service or property changes
  useEffect(() => {
    if (servicePricing?.basePrice) {
      setCalculatedPrice(servicePricing.basePrice);
    }
  }, [servicePricing]);

  // Auto-deselect BNB-cleaning if property size is over 100 sqm
  useEffect(() => {
    if (selectedProperty && selectedService === 'bnb-cleaning') {
      const selectedPropertyData = properties?.find((p) => p._id === selectedProperty);
      const propertySize = selectedPropertyData?.size ? Number.parseInt(selectedPropertyData.size) : 0;
      
      if (propertySize > 100) {
        // Automatically switch to deep-cleaning (Standardvask) as the default alternative
        setSelectedService('deep-cleaning');
      }
    }
  }, [selectedProperty, selectedService, properties]);

  const calculatePrice = () => {
    if (!servicePricing || !selectedService || !selectedProperty) return 0;
    return servicePricing.basePrice || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !selectedService || !scheduledDate) {
      alert(t('form.fillRequired'));
      return;
    }

    // Check if selected property has a size
    const selectedPropertyData = properties?.find((p) => p._id === selectedProperty);
    if (!selectedPropertyData?.size || selectedPropertyData.size === '') {
      alert(
        'Selected property does not have a size set. Please update the property size in your profile.'
      );
      return;
    }

    // Check if BNB-cleaning is selected for properties larger than 100 sqm
    const propertySize = Number.parseInt(selectedPropertyData.size);
    if (selectedService === 'bnb-cleaning' && propertySize > 100) {
      alert(
        'BNB-vask is only available for properties up to 100 m². Please select either Standardvask or Flyttevask for larger properties.'
      );
      return;
    }

    const price = calculatePrice();
    if (price <= 0) {
      alert('Unable to calculate price. Please ensure property size is set.');
      return;
    }

    setCalculatedPrice(price);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsSubmitting(true);
    try {
      const platformFee = Math.round(calculatedPrice * 0.2 * 100) / 100; // 20% platform fee
      const cleanerPayout = Math.round(calculatedPrice * 0.8 * 100) / 100; // 80% to cleaner

      const jobId = await createCleaningJob({
        landlordId,
        propertyId: selectedProperty as any,
        serviceType: selectedService as any,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTimeRange || null,
        specialInstructions: specialInstructions || null,
        pricePerDate: calculatedPrice,
        totalPrice: calculatedPrice,
        platformFee: platformFee,
        cleanerPayout: cleanerPayout,
        stripePaymentIntentId: paymentIntentId,
      });

      // Mark payment as authorized since we're using manual capture
      await markPaymentAuthorized({
        jobId,
        stripePaymentIntentId: paymentIntentId,
      });

      // Reset form
      setSelectedProperty('');
      setSelectedService('bnb-cleaning');
      setScheduledDate('');
      setScheduledTimeRange('');
      setSpecialInstructions('');
      setShowPayment(false);
      setCalculatedPrice(0);
    } catch (error) {
      console.error('Error creating cleaning job:', error);
      alert('Failed to create cleaning job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPayment) {
    return (
      <StripePaymentForm
        amount={calculatedPrice}
        scheduledDates={[scheduledDate]}
        scheduledTime={scheduledTimeRange || null}
        propertyName={properties?.find((p) => p._id === selectedProperty)?.name || ''}
        serviceType={selectedService}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={() => setShowPayment(false)}
      />
    );
  }

  // Check if any properties have sizes set
  const propertiesWithSizes = properties?.filter((p) => p.size && p.size !== '') || [];
  if (propertiesWithSizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties Need Size Information</CardTitle>
          <CardDescription>
            All your properties need to have their size (in m²) set before you can book cleaning
            services. Please update your properties in your profile.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {t('bookingForm.title')}
          </CardTitle>
          <CardDescription>{t('bookingForm.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('form.propertyLabel')}
              </label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="h-auto min-h-[2.5rem]">
                  {selectedProperty ? (
                    <div className="flex items-center gap-2 w-full py-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0 text-left">
                        <span className="truncate">
                          {propertiesWithSizes.find((p) => p._id === selectedProperty)?.name}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {propertiesWithSizes.find((p) => p._id === selectedProperty)?.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {propertiesWithSizes.find((p) => p._id === selectedProperty)?.size}m²
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <SelectValue placeholder="Choose a property" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {propertiesWithSizes.map((property: Property) => (
                    <SelectItem key={property._id} value={property._id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{property.name}</span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {property.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {property.size}m²
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('form.serviceLabel')}
              </label>
              <ServiceTypeSelector
                selectedService={selectedService}
                onServiceChange={setSelectedService}
                propertySize={properties?.find((p) => p._id === selectedProperty)?.size || '0'}
              />
            </div>

            {/* Date and Time */}
            <DateTimeSelector
              selectedDate={scheduledDate}
              selectedTimeRange={scheduledTimeRange}
              onDateChange={setScheduledDate}
              onTimeRangeChange={setScheduledTimeRange}
            />

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('form.instructionsLabel')}
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSpecialInstructions(e.target.value)
                }
                placeholder={t('form.instructionsPlaceholder')}
                rows={3}
              />
            </div>

            {/* Pricing Information */}
            {/* Price Display */}
            <PaymentInfoCard
              price={calculatedPrice}
              showPrice={!_shouldSkipQuery && calculatedPrice > 0}
            />

            {/* Pricing Error Message */}
            {selectedService && selectedProperty && !servicePricing && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-destructive font-medium">
                      Unable to calculate price
                    </p>
                    <p className="text-xs text-destructive/70 mt-1">
                      This usually means the property size is not set or the pricing data is not
                      available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedProperty ||
                !selectedService ||
                !scheduledDate ||
                !servicePricing ||
                !servicePricing.basePrice
              }
              className="w-full"
            >
              {!servicePricing ? t('form.calculating') : t('form.continuePayment')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
