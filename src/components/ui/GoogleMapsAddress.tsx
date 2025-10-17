'use client';

import { ExternalLink, MapPin } from 'lucide-react';
import { Button } from './button';

interface GoogleMapsAddressProps {
  address: string;
  city?: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'button' | 'link';
}

export default function GoogleMapsAddress({
  address,
  city,
  className = '',
  showIcon = true,
  variant = 'link',
}: GoogleMapsAddressProps) {
  const fullAddress = city ? `${address}, ${city}` : address;
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`flex items-center gap-2 ${className}`}
      >
        {showIcon && <MapPin className="h-4 w-4" />}
        <span className="truncate">{address}</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-left hover:text-primary transition-colors ${className}`}
      title={`Open ${fullAddress} in Google Maps`}
    >
      {showIcon && <MapPin className="h-4 w-4 flex-shrink-0" />}
      <span className="truncate">{address}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
    </button>
  );
}
