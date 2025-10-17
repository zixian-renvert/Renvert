'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

interface GoogleAddress {
  id: string;
  displayName: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

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

interface AddressSearchProps {
  onAddressSelect: (address: AddressDetails | null) => void;
  selectedAddress: AddressDetails | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function AddressSearch({
  onAddressSelect,
  selectedAddress,
  label = 'Address Search',
  placeholder = 'Search for address...',
  required = false,
}: AddressSearchProps) {
  const _t = useTranslations('onboarding');
  const [query, setQuery] = useState('');
  const [addresses, setAddresses] = useState<GoogleAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>('');

  useEffect(() => {
    // Generate a new session token for this search session
    sessionTokenRef.current =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAddresses([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google/places?q=${encodeURIComponent(searchQuery)}&sessionToken=${sessionTokenRef.current}`
      );

      if (!response.ok) {
        throw new Error('Failed to search addresses');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAddresses(data.addresses || []);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search addresses');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        searchAddresses(value);
      } else {
        setAddresses([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const handleAddressSelect = async (address: GoogleAddress) => {
    try {
      // Get detailed address information
      const response = await fetch(`/api/google/places/details?placeId=${address.id}`);

      if (!response.ok) {
        throw new Error('Failed to get address details');
      }

      const addressDetails: AddressDetails = await response.json();

      // Directly select the address without popup
      onAddressSelect(addressDetails);
      setQuery(addressDetails.formattedAddress);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get address details');
    }
  };

  const handleClear = () => {
    onAddressSelect(null);
    setQuery('');
    setAddresses([]);
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-10"
            required={required}
          />
          {selectedAddress && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Searching addresses...</div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">{error}</div>
            ) : addresses.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No addresses found</div>
            ) : (
              <div className="py-2">
                {addresses.map((address) => (
                  <button
                    type="button"
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{address.mainText}</div>
                        <div className="text-sm text-muted-foreground">{address.secondaryText}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
