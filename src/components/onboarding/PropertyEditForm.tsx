'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from 'convex/react';
import { Home, Loader2, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';

interface Property {
  _id: string;
  name: string;
  type: string;
  address: string;
  postalCode: string | null;
  city: string | null;
  size: string | null;
  unitDetails: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PropertyEditFormProps {
  property: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PropertyEditForm({ property, onSuccess, onCancel }: PropertyEditFormProps) {
  const t = useTranslations('properties');

  const [formData, setFormData] = useState({
    name: property.name,
    type: property.type,
    address: property.address,
    postalCode: property.postalCode || '',
    city: property.city || '',
    size: property.size || '',
    unitDetails: property.unitDetails || '',
    isActive: property.isActive,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProperty = useMutation(api.properties.updateProperty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProperty({
        propertyId: property._id as any,
        updates: {
          name: formData.name,
          type: formData.type as any,
          address: formData.address,
          postalCode: formData.postalCode || null,
          city: formData.city || null,
          size: formData.size || null,
          unitDetails: formData.unitDetails || null,
          isActive: formData.isActive,
          updatedAt: Date.now(),
        },
      });

      alert(t('edit.successMessage'));
      onSuccess();
    } catch (error) {
      console.error('Error updating property:', error);
      alert(t('edit.errorMessage', { error: String(error) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {t('edit.title', { name: property.name })}
          </CardTitle>
          <CardDescription>{t('edit.description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('edit.form.name.label')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('edit.form.name.placeholder')}
                required
              />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('edit.form.type.label')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('edit.form.type.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">{t('edit.form.type.options.apartment')}</SelectItem>
                  <SelectItem value="hytte">{t('edit.form.type.options.hytte')}</SelectItem>
                  <SelectItem value="office">{t('edit.form.type.options.office')}</SelectItem>
                  <SelectItem value="house">{t('edit.form.type.options.house')}</SelectItem>
                  <SelectItem value="commercial">
                    {t('edit.form.type.options.commercial')}
                  </SelectItem>
                  <SelectItem value="other">{t('edit.form.type.options.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('edit.form.address.label')} *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={t('edit.form.address.placeholder')}
                required
              />
            </div>

            {/* Postal Code and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('edit.form.postalCode.label')}</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder={t('edit.form.postalCode.placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('edit.form.city.label')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={t('edit.form.city.placeholder')}
                />
              </div>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">{t('edit.form.size.label')} *</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder={t('edit.form.size.placeholder')}
                min="1"
                max="300"
                required
              />
              <p className="text-sm text-muted-foreground">{t('edit.form.size.helpText')}</p>
            </div>

            {/* Unit Details */}
            <div className="space-y-2">
              <Label htmlFor="unitDetails">{t('edit.form.unitDetails.label')}</Label>
              <Textarea
                id="unitDetails"
                value={formData.unitDetails}
                onChange={(e) => handleInputChange('unitDetails', e.target.value)}
                placeholder={t('edit.form.unitDetails.placeholder')}
                rows={3}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">{t('edit.form.isActive.label')}</Label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? t('edit.form.submit.updating') : t('edit.form.submit.update')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('edit.form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
