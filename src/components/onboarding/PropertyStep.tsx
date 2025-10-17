'use client';

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
import { Briefcase, Building2, Home, Mountain, Plus, Trash2, Warehouse } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PropertyStepProps {
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

const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: 'Apartment',
  hytte: 'Cabin',
  office: 'Office',
  house: 'House',
  commercial: 'Commercial',
  other: 'Other',
};

export default function PropertyStep({
  properties,
  onAddProperty,
  onUpdateProperty,
  onRemoveProperty,
}: PropertyStepProps) {
  const _t = useTranslations('onboarding');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Properties</h2>
        <p className="text-lg text-muted-foreground">
          Add the properties you want to list for cleaning services
        </p>
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
                  <h3 className="text-lg font-semibold">Property {index + 1}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveProperty(property.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Property Name</label>
                  <Input
                    placeholder="e.g., Downtown Apartment, Office Building"
                    value={property.name}
                    onChange={(e) => onUpdateProperty(property.id, 'name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Property Type</label>
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
                      {Object.entries(propertyTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <Input
                    placeholder="Street address"
                    value={property.address}
                    onChange={(e) => onUpdateProperty(property.id, 'address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Postal Code</label>
                  <Input
                    placeholder="0000"
                    value={property.postalCode}
                    onChange={(e) => onUpdateProperty(property.id, 'postalCode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input
                    placeholder="City name"
                    value={property.city}
                    onChange={(e) => onUpdateProperty(property.id, 'city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Size (m²)
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={property.size}
                    onChange={(e) => onUpdateProperty(property.id, 'size', e.target.value)}
                    required
                    min={1}
                    max={300}
                    aria-required
                  />
                </div>
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
          Add Another Property
        </Button>
      </div>

      {/* Help text */}
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          You can add multiple properties. Each property will be listed separately for cleaning
          services.
        </p>
      </div>
    </div>
  );
}
