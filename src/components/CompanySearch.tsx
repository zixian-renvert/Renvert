'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BrregCompany } from '@/types/onboarding';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface CompanySearchProps {
  onCompanySelect: (company: BrregCompany | null) => void;
  selectedCompany?: BrregCompany | null;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function CompanySearch({
  onCompanySelect,
  selectedCompany,
  placeholder = 'Enter company name or organization number...',
  label = 'Company Search',
  required = false,
}: CompanySearchProps) {
  const t = useTranslations('onboarding');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BrregCompany[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Auto-detect if input is organization number (9 digits) or company name
  const _isOrganizationNumber = (query: string) => /^\d{9}$/.test(query.trim());

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    // Don't search if we already have a selected company and the query matches
    if (selectedCompany && searchQuery === selectedCompany.navn) {
      return;
    }

    if (debouncedQuery.trim().length >= 3) {
      // Only search if 3+ characters
      performSearch(debouncedQuery.trim());
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, selectedCompany, searchQuery]);

  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < 3) return;

      setIsSearching(true);
      setError(null);

      try {
        // Auto-detect search type
        const searchType = /^\d{9}$/.test(query.trim()) ? 'orgNumber' : 'name';

        const response = await fetch(
          `/api/brreg/search?q=${encodeURIComponent(query)}&type=${searchType}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Search failed');
          setSearchResults([]);
          setShowResults(false); // Hide results on error
          return;
        }

        if (searchType === 'orgNumber') {
          // Single company result - auto-select and don't show popup
          if (data.company) {
            onCompanySelect(data.company);
            setSearchQuery(data.company.navn);
            setSearchResults([]); // Clear results after selection
            setShowResults(false); // Hide results after selection
            return; // Exit early as company is selected
          }
          setSearchResults([]);
          setShowResults(false);
        } else {
          // Multiple companies result
          setSearchResults(data.companies || []);
          setShowResults(data.companies && data.companies.length > 0);
        }
      } catch (_err) {
        setError('Failed to search companies');
        setSearchResults([]);
        setShowResults(false); // Hide results on error
      } finally {
        setIsSearching(false);
      }
    },
    [onCompanySelect]
  );

  const handleCompanySelect = (company: BrregCompany) => {
    onCompanySelect(company);
    setSearchQuery(company.navn);
    setSearchResults([]); // Clear results after selection
    setShowResults(false); // Hide results after selection
    setError(null);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
    onCompanySelect(null); // Pass null directly, no need for type assertion
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If user is typing something different from selected company, hide results
    if (selectedCompany && value !== selectedCompany.navn) {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleInputFocus = () => {
    // Only show results if we have them and user is actively searching (not just focusing)
    if (searchQuery.trim().length >= 3 && searchResults.length > 0 && !selectedCompany) {
      setShowResults(true);
    }
  };

  const formatAddress = (address?: {
    adresse: string | string[];
    postnummer: string;
    poststed: string;
    land: string;
  }) => {
    if (!address) return '';
    const addressStr = Array.isArray(address.adresse)
      ? address.adresse.join(', ')
      : address.adresse;
    return `${addressStr}, ${address.postnummer} ${address.poststed}, ${address.land}`;
  };

  useEffect(() => {
    if (selectedCompany) {
      setSearchQuery(selectedCompany.navn);
      // Ensure results are hidden when company is selected
      setShowResults(false);
      setSearchResults([]);
    } else {
      // Clear search query when no company is selected
      setSearchQuery('');
    }
  }, [selectedCompany]);

  return (
    <div className="space-y-4">
      {label && (
        <label htmlFor="company-search-input" className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <Input
          id="company-search-input"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="h-11 pr-12"
          required={required}
        />

        {/* Search indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        )}

        {/* Clear button */}
        {selectedCompany && (
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            type="button"
          >
            ×
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="border border-border rounded-lg max-h-64 overflow-y-auto shadow-lg bg-card">
          {searchResults.map((company) => (
            <button
              key={company.organisasjonsnummer}
              onClick={() => handleCompanySelect(company)}
              className="w-full p-4 text-left hover:bg-accent/50 transition-colors border-b border-border last:border-b-0 focus:bg-accent/50 focus:outline-none"
              type="button"
            >
              <div className="space-y-1">
                <div className="font-medium text-foreground">{company.navn}</div>
                <div className="text-sm text-muted-foreground">
                  {t('step3.cleaner.company.org-number-label', { default: 'Organization Number' })}:{' '}
                  {company.organisasjonsnummer}
                </div>
                {company.forretningsadresse && (
                  <div className="text-sm text-muted-foreground">
                    {formatAddress(company.forretningsadresse)}
                  </div>
                )}
                {company.organisasjonsform && (
                  <div className="text-sm text-muted-foreground">
                    {company.organisasjonsform.beskrivelse}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        searchResults.length === 0 &&
        searchQuery.trim().length >= 3 &&
        !isSearching && (
          <div className="p-4 text-center text-muted-foreground border border-border rounded-lg">
            {t('step3.cleaner.company.no-results')}
          </div>
        )}

      {/* Help text */}
      {searchQuery.trim().length > 0 && /^\d{9}$/.test(searchQuery.trim()) ? (
        <p className="text-xs text-muted-foreground">
          {t('step3.cleaner.company.help-searching-org')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('step3.cleaner.company.help-start-typing')}
        </p>
      )}

      {/* Selected company display */}
      {selectedCompany && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">Company Selected ✓</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Name:</strong> {selectedCompany.navn}
              </p>
              <p>
                <strong>Organization Number:</strong> {selectedCompany.organisasjonsnummer}
              </p>
              {selectedCompany.forretningsadresse && (
                <p>
                  <strong>Address:</strong> {formatAddress(selectedCompany.forretningsadresse)}
                </p>
              )}
              {selectedCompany.organisasjonsform && (
                <p>
                  <strong>Type:</strong> {selectedCompany.organisasjonsform.beskrivelse}
                </p>
              )}
              {selectedCompany.registreringsdatoEnhetsregisteret && (
                <p>
                  <strong>Registered:</strong>{' '}
                  {new Date(selectedCompany.registreringsdatoEnhetsregisteret).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
