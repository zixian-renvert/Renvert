'use client';

import AddressSearch from '@/components/AddressSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Property, PropertyType } from '@/types/onboarding';
import { useMutation } from 'convex/react';
import { Briefcase, Building2, Home, Mountain, Plus, Trash2, Warehouse } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';

interface AddressDetails {
  id: string;
  formattedAddress: string;
  streetNumber: string;
  streetName: string;
  postalCode: string;
  city: string;
  municipality: string;
  county: string;
  country: string;
  latitude: number;
  longitude: number;
  types: string[];
}

interface PropertyFormProps {
  properties: Property[];
  onAddProperty: () => void;
  onUpdateProperty: (id: string, field: keyof Property, value: any) => void;
  onRemoveProperty: (id: string) => void;
}

const propertyTypeIcons: Record<PropertyType, React.ComponentType<any>> = {
  apartment: Home,
  hytte: Mountain,
  office: Briefcase,
  house: Building2,
  commercial: Warehouse,
  other: Building2,
};

export default function PropertyForm({
  properties,
  onAddProperty,
  onUpdateProperty,
  onRemoveProperty,
}: PropertyFormProps) {
  const t = useTranslations('onboarding');
  // Access field-level errors from the onboarding page via a global store would be ideal.
  // For now, we read from a custom event detail if present (set by the page) as a lightweight bridge.
  const [errors, setErrors] = useState<Record<number, { address?: string; size?: string }>>({});
  // Listen to a custom event dispatched by the page with current field errors
  typeof window !== 'undefined' &&
    window.addEventListener('onboarding:fieldErrors', (e: any) => {
      setErrors(e.detail?.properties || {});
    });

  const handleAddressSelect = (propertyId: string, address: AddressDetails | null) => {
    if (address) {
      // Update the property with the selected address data
      onUpdateProperty(propertyId, 'address', address.formattedAddress);
      onUpdateProperty(propertyId, 'postalCode', address.postalCode);
      onUpdateProperty(propertyId, 'city', address.city);
    } else {
      // Clear the address data
      onUpdateProperty(propertyId, 'address', '');
      onUpdateProperty(propertyId, 'postalCode', '');
      onUpdateProperty(propertyId, 'city', '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('step3.landlord.properties.title')}
        </h2>
        <p className="text-lg text-muted-foreground">{t('step3.landlord.properties.subtitle')}</p>
      </div>

      {/* Properties List */}
      <div className="space-y-6">
        {properties.map((property, index) => {
          const IconComponent = propertyTypeIcons[property.type];

          return (
            <div
              key={property.id}
              className="p-6 border border-border rounded-lg bg-card space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {t('step3.landlord.properties.property')} {index + 1}
                  </h3>
                </div>
                {properties.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveProperty(property.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('step3.landlord.properties.remove')}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('step3.landlord.properties.type')}
                  </label>
                  <Select
                    value={property.type}
                    onValueChange={(value: PropertyType) =>
                      onUpdateProperty(property.id, 'type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(
                        t.raw('step3.landlord.properties.types') as Record<string, string>
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <AddressSearch
                    onAddressSelect={(address) => handleAddressSelect(property.id, address)}
                    selectedAddress={
                      property.address
                        ? {
                            id: '',
                            formattedAddress: property.address,
                            streetNumber: '',
                            streetName: '',
                            postalCode: property.postalCode,
                            city: property.city,
                            municipality: '',
                            county: '',
                            country: '',
                            latitude: 0,
                            longitude: 0,
                            types: [],
                          }
                        : null
                    }
                    label={t('step3.landlord.properties.address')}
                    placeholder={t('step3.landlord.properties.address-placeholder')}
                    required={true}
                  />
                  {errors[index]?.address && (
                    <p className="text-xs text-destructive">{errors[index]?.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('step3.landlord.properties.size')}
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder={t('step3.landlord.properties.size-placeholder')}
                    value={property.size}
                    onChange={(e) => onUpdateProperty(property.id, 'size', e.target.value)}
                    required
                    min={1}
                    max={300}
                    aria-required
                  />
                  {errors[index]?.size && (
                    <p className="text-xs text-destructive">{errors[index]?.size}</p>
                  )}
                </div>
              </div>

              {/* Unit Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('step3.landlord.properties.unit-details')}
                </label>
                <Input
                  placeholder={t('step3.landlord.properties.unit-details-placeholder')}
                  value={property.unitDetails || ''}
                  onChange={(e) => onUpdateProperty(property.id, 'unitDetails', e.target.value)}
                />
              </div>
            </div>
          );
        })}

        {/* Add Property Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onAddProperty}
          className="w-full h-16 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('step3.landlord.properties.add-property')}
        </Button>
      </div>

      {/* Help text */}
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">{t('step3.landlord.properties.help-text')}</p>
      </div>
    </div>
  );
}
