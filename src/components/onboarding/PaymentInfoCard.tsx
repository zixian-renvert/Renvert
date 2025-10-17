'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, Clock, CreditCard, HelpCircle, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PaymentInfoCardProps {
  price?: number;
  showPrice?: boolean;
}

export default function PaymentInfoCard({ price, showPrice = false }: PaymentInfoCardProps) {
  const t = useTranslations('booking');

  return (
    <>
      {/* Price Display with Payment Info Link */}
      {showPrice && price && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-2xl font-bold">{price} NOK</div>
                <div className="text-sm text-muted-foreground">{t('priceDisplay.totalPrice')}</div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <HelpCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{t('priceDisplay.howPaymentWorks')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      {t('paymentInfo.title')}
                    </DialogTitle>
                    <DialogDescription>{t('paymentInfo.description')}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-blue-600">1</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{t('paymentInfo.step1.title')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('paymentInfo.step1.description')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-orange-600">2</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{t('paymentInfo.step2.title')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('paymentInfo.step2.description')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-semibold text-green-600">3</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{t('paymentInfo.step3.title')}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('paymentInfo.step3.description')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">
                            {t('paymentInfo.guarantee.title')}
                          </p>
                          <p className="text-blue-700">{t('paymentInfo.guarantee.description')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
