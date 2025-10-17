'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/nextjs';
import { Calendar, Clock, CreditCard, Home, MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  amount: number;
  scheduledDates: string[];
  scheduledTime?: string | null;
  propertyName: string;
  serviceType: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentCancel: () => void;
}

function PaymentFormContent({
  amount,
  scheduledDates,
  scheduledTime,
  propertyName,
  serviceType,
  onPaymentSuccess,
  onPaymentCancel,
}: StripePaymentFormProps) {
  const t = useTranslations('booking');
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError(t('payment.errors.systemNotReady'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || t('payment.errors.paymentFailed'));
        return;
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || t('payment.errors.paymentFailed'));
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')
      ) {
        setPaymentSuccess(true);
        // Extract payment intent ID and call success handler
        const paymentIntentId = paymentIntent.id;
        onPaymentSuccess(paymentIntentId);
      } else {
        setError(t('payment.errors.paymentNotCompleted'));
      }
    } catch (err) {
      setError(t('payment.errors.unexpectedError'));
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <CreditCard className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('payment.paymentSuccessful')}</h3>
            <p className="text-muted-foreground">{t('payment.serviceBooked')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('payment.title')}
        </CardTitle>
        <CardDescription>{t('payment.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('payment.totalAmount')}</span>
            <span className="text-2xl font-bold text-primary">{amount} NOK</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>{propertyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {scheduledDates.length} {scheduledDates.length > 1 ? t('payment.dates') : t('payment.date')}
              </span>
            </div>
            {scheduledTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{scheduledTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">{serviceType.replace('-', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Date List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('payment.scheduledDates')}</h4>
          <div className="space-y-1">
            {scheduledDates.map((date, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />

          {/* Save Payment Method Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-payment"
              checked={savePaymentMethod}
              onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
            />
            <label
              htmlFor="save-payment"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('payment.savePaymentMethod')}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPaymentCancel}
              className="flex-1"
              disabled={isLoading}
            >
              {t('payment.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !stripe}>
              {isLoading ? t('payment.processing') : t('payment.pay', { amount })}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center">
          🔒 {t('payment.securityNotice')}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const { user } = useUser();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts and user is loaded
    if (user?.primaryEmailAddress?.emailAddress) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.amount, user]);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userEmail = user?.primaryEmailAddress?.emailAddress || 'customer@example.com';

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: props.amount,
          currency: 'nok',
          setup_future_usage: 'off_session', // Allow future payments
          metadata: {
            email: userEmail,
            serviceType: props.serviceType,
            propertyName: props.propertyName,
            scheduledDates: props.scheduledDates.join(','),
            scheduledTime: props.scheduledTime || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
    } catch (err) {
      setError(t('payment.errors.initializationFailed'));
      console.error('Error creating payment intent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>{t('payment.initializingPayment')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={createPaymentIntent} variant="outline">
              {t('payment.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        locale: locale as any,
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0f172a',
          },
        },
      }}
    >
      <PaymentFormContent {...props} />
    </Elements>
  );
}
