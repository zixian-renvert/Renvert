'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Edit, Home, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Property {
  _id: string;
  name: string;
  type: string;
  address: string;
  city: string | null;
  size: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PropertiesListProps {
  properties: Property[] | undefined;
  userId: string;
  onEditProperty?: (propertyId: string) => void;
}

export default function PropertiesList({
  properties,
  userId,
  onEditProperty,
}: PropertiesListProps) {
  const t = useTranslations('properties');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      apartment: 'bg-blue-100 text-blue-800',
      hytte: 'bg-green-100 text-green-800',
      office: 'bg-purple-100 text-purple-800',
      house: 'bg-orange-100 text-orange-800',
      commercial: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      apartment: t('types.apartment'),
      hytte: t('types.hytte'),
      office: t('types.office'),
      house: t('types.house'),
      commercial: t('types.commercial'),
      other: t('types.other'),
    };
    return labels[type] || type;
  };

  const handleEditProperty = (propertyId: string) => {
    if (onEditProperty) {
      onEditProperty(propertyId);
    } else {
      // Fallback: show alert with property ID for now
      alert(`Edit property ${propertyId} - This will open an edit form`);
    }
  };

  // Handle loading state
  if (!properties) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProperties.title')}</h3>
        <p className="text-gray-500 mb-4">{t('noProperties.description')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                    {property.city && <Badge variant="outline">{property.city}</Badge>}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getPropertyTypeColor(property.type)}>
                  {getPropertyTypeLabel(property.type)}
                </Badge>
                <Badge variant={property.isActive ? 'default' : 'secondary'}>
                  {property.isActive ? t('status.active') : t('status.inactive')}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('added')}:</span>
                  <span>{formatDate(property.createdAt)}</span>
                </div>

                {property.size && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('size')}:</span>
                    <span>{property.size} m²</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProperty(property._id)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {t('editButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
