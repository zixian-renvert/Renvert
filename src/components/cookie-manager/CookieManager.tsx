'use client';

import { Button } from '@/components/ui/button';
import { client } from '@/sanity/lib/client';
import { submitCookieConsent } from '@/ui/actions/cookieConsent';
import type { CookieCategory } from '@/ui/actions/cookieConsent';
import { ChevronDown, ChevronRight, Cookie, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PortableText, groq } from 'next-sanity';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CookieManagerProps {
  mode?: 'banner' | 'modal';
}

interface CookieInfo {
  name: string;
  duration: string;
  description: string;
  type: 'http-cookie' | 'local-storage';
  vendor: string;
}

interface CookieCategoryConfig {
  category: string;
  cookies: CookieInfo[];
  description: string;
  required: boolean;
}

interface SiteSettings {
  cookieConsent: {
    enabled: boolean;
    bannerTitle: string;
    bannerText: any[];
    acceptButtonText: string;
    rejectButtonText: string;
    preferencesButtonText: string;
    cookieCategories: CookieCategoryConfig[];
  };
}

interface CookiePreferences {
  necessary: CookieCategory;
  analytics: CookieCategory;
  marketing: CookieCategory;
  functional: CookieCategory;
}

function transformCookiePreferences(
  siteSettings: SiteSettings | null,
  preferences: Record<string, boolean>
): CookiePreferences {
  return {
    necessary: {
      allowed: preferences.necessary || false,
      cookieRecords:
        siteSettings?.cookieConsent.cookieCategories
          .find((cat) => cat.category === 'necessary')
          ?.cookies.map((cookie) => ({
            cookie: cookie.name,
            duration: cookie.duration,
            description: cookie.description,
          })) || [],
    },
    analytics: {
      allowed: preferences.analytics || false,
      cookieRecords:
        siteSettings?.cookieConsent.cookieCategories
          .find((cat) => cat.category === 'analytics')
          ?.cookies.map((cookie) => ({
            cookie: cookie.name,
            duration: cookie.duration,
            description: cookie.description,
          })) || [],
    },
    marketing: {
      allowed: preferences.marketing || false,
      cookieRecords:
        siteSettings?.cookieConsent.cookieCategories
          .find((cat) => cat.category === 'marketing')
          ?.cookies.map((cookie) => ({
            cookie: cookie.name,
            duration: cookie.duration,
            description: cookie.description,
          })) || [],
    },
    functional: {
      allowed: preferences.functional || false,
      cookieRecords:
        siteSettings?.cookieConsent.cookieCategories
          .find((cat) => cat.category === 'functional')
          ?.cookies?.map((cookie) => ({
            cookie: cookie.name,
            duration: cookie.duration,
            description: cookie.description,
          })) || [],
    },
  };
}

export default function CookieManager({ mode = 'banner' }: CookieManagerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [cookiePreferences, setCookiePreferences] = useState<Record<string, boolean>>({});
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_showPreferences, setShowPreferences] = useState(false);
  const t = useTranslations('CookieManager');
  const locale = useLocale();
  // Fetch site settings from Sanity
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const query = groq`*[_type == "site" && language == '${locale}'][0] {
          cookieConsent {
            enabled,
            bannerTitle,
            bannerText,
            acceptButtonText,
            rejectButtonText,
            preferencesButtonText,
            cookieCategories[] {
              category,
              cookies[] {
                name,
                duration,
                description,
                type,
                vendor
              },
              description,
              required
            }
          }
        }`;
        const data = await client.fetch(query);
        setSiteSettings(data);
      } catch (error) {
        console.error('Error fetching cookie settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [locale]);

  useEffect(() => {
    if (!siteSettings?.cookieConsent?.enabled || isLoading) return;

    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }

    // Initialize cookie preferences from saved state or defaults
    const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
    const initialPreferences: Record<string, boolean> = {};

    for (const category of siteSettings.cookieConsent.cookieCategories) {
      initialPreferences[category.category] =
        category.required || savedPreferences[category.category] || false;
    }

    setCookiePreferences(initialPreferences);
  }, [mode, siteSettings, isLoading]);

  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setIsVisible(true);
      setShowAdvanced(true);
    };

    window.addEventListener('openCookieSettings', handleOpenCookieSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
  }, []);

  useEffect(() => {
    const handleOpenCookieManager = () => {
      setShowPreferences(true);
    };

    window.addEventListener('openCookieManager', handleOpenCookieManager);
    return () => window.removeEventListener('openCookieManager', handleOpenCookieManager);
  }, []);

  const acceptAll = async () => {
    try {
      const allAccepted: Record<string, boolean> = {};
      if (siteSettings?.cookieConsent.cookieCategories) {
        for (const category of siteSettings.cookieConsent.cookieCategories) {
          allAccepted[category.category] = true;
        }
      }

      const cookiePreferences = transformCookiePreferences(siteSettings, allAccepted);
      await submitCookieConsent('accepted', cookiePreferences);

      // Only update client state if server action succeeds
      localStorage.setItem('cookieConsent', 'all');
      localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
      setCookiePreferences(allAccepted);
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
      // Show error to user (you may want to add a toast notification here)
      alert('Failed to save cookie preferences. Please try again.');
    }
  };

  const rejectAll = async () => {
    try {
      const necessaryOnly: Record<string, boolean> = {};
      if (siteSettings?.cookieConsent.cookieCategories) {
        for (const category of siteSettings.cookieConsent.cookieCategories) {
          necessaryOnly[category.category] = category.required;
        }
      }

      const cookiePreferences = transformCookiePreferences(siteSettings, necessaryOnly);
      await submitCookieConsent('declined', cookiePreferences);

      // Only update client state if server action succeeds
      localStorage.setItem('cookieConsent', 'rejected');
      localStorage.setItem('cookiePreferences', JSON.stringify(necessaryOnly));
      setCookiePreferences(necessaryOnly);
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
      // Show error to user (you may want to add a toast notification here)
      alert('Failed to save cookie preferences. Please try again.');
    }
  };

  const savePreferences = async () => {
    try {
      const cookiePreferencesData = transformCookiePreferences(siteSettings, cookiePreferences);
      await submitCookieConsent('partial', cookiePreferencesData);

      // Only update client state if server action succeeds
      localStorage.setItem('cookieConsent', 'partial');
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
      // Show error to user (you may want to add a toast notification here)
      alert('Failed to save cookie preferences. Please try again.');
    }
  };

  const toggleCookieType = (category: string) => {
    const categoryData = siteSettings?.cookieConsent.cookieCategories.find(
      (cat: CookieCategoryConfig) => cat.category === category
    );
    if (categoryData?.required) return; // Can't toggle required categories

    setCookiePreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const close = () => {
    const hasConsented = localStorage.getItem('cookieConsent');
    if (hasConsented) {
      setIsVisible(false);
    }
  };

  if (isLoading || !isVisible || !siteSettings?.cookieConsent) return null;

  // If cookies are disabled, don't render anything
  if (!siteSettings.cookieConsent.enabled) {
    return null;
  }
  const hasConsented = localStorage.getItem('cookieConsent');

  // Render as modal
  if (mode === 'modal' || (mode === 'banner' && showAdvanced)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <button
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${!hasConsented ? 'cursor-default' : ''}`}
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') close();
          }}
          disabled={!hasConsented}
          tabIndex={0}
          aria-label="Close cookie manager"
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Cookie className="h-6 w-6 text-[#CF3D45] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('cookie-settings')}</h2>
            </div>
            <button
              type="button"
              disabled={!hasConsented}
              onClick={close}
              className={`text-gray-400  transition-colors ${!hasConsented ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-500'}`}
              aria-label="Lukk"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-6">
              <div className="text-gray-600">
                <PortableText
                  value={siteSettings.cookieConsent.bannerText}
                  components={{
                    marks: {
                      link: ({ children, value }) => (
                        <Link href={value?.href || '#'} className="text-[#CF3D45] hover:underline">
                          {children}
                        </Link>
                      ),
                    },
                  }}
                />
              </div>
            </div>

            <CookieCategories
              categories={siteSettings.cookieConsent.cookieCategories}
              cookiePreferences={cookiePreferences}
              expandedCategory={expandedCategory}
              toggleCookieType={toggleCookieType}
              toggleCategoryExpansion={toggleCategoryExpansion}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={rejectAll}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              {siteSettings.cookieConsent.rejectButtonText}
            </Button>

            <Button
              onClick={savePreferences}
              variant="outline"
              className="border-[#CF3D45] text-[#CF3D45] hover:bg-[#CF3D45]/10"
            >
              {siteSettings.cookieConsent.preferencesButtonText}
            </Button>
            <Button onClick={acceptAll} className="bg-[#CF3D45] hover:bg-[#b83740] text-white">
              {siteSettings.cookieConsent.acceptButtonText}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render as banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200 max-h-[80vh] overflow-y-auto">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {siteSettings.cookieConsent.bannerTitle}
                </h3>
                <div className="text-gray-600 text-sm">
                  <PortableText
                    value={siteSettings.cookieConsent.bannerText}
                    components={{
                      marks: {
                        link: ({ children, value }) => (
                          <Link
                            href={value?.href || '#'}
                            className="text-[#CF3D45] hover:underline"
                          >
                            {children}
                          </Link>
                        ),
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="flex-1 md:flex-none border-gray-300 hover:bg-gray-50 text-sm"
              >
                {siteSettings.cookieConsent.preferencesButtonText}
              </Button>
              <Button
                onClick={rejectAll}
                variant="outline"
                className="flex-1 md:flex-none border-gray-300 hover:bg-gray-50 text-sm"
              >
                {siteSettings.cookieConsent.rejectButtonText}
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1 md:flex-none bg-[#CF3D45] hover:bg-[#b83740] text-white text-sm"
              >
                {siteSettings.cookieConsent.acceptButtonText}
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="border-t border-gray-200 pt-4 mt-2">
              <CookieCategories
                categories={siteSettings.cookieConsent.cookieCategories}
                cookiePreferences={cookiePreferences}
                expandedCategory={expandedCategory}
                toggleCookieType={toggleCookieType}
                toggleCategoryExpansion={toggleCategoryExpansion}
              />
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={savePreferences}
                  className="bg-[#CF3D45] hover:bg-[#b83740] text-white"
                >
                  {siteSettings.cookieConsent.preferencesButtonText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Shared component for cookie categories
function CookieCategories({
  categories,
  cookiePreferences,
  expandedCategory,
  toggleCookieType,
  toggleCategoryExpansion,
}: {
  categories: CookieCategoryConfig[];
  cookiePreferences: Record<string, boolean>;
  expandedCategory: string | null;
  toggleCookieType: (category: string) => void;
  toggleCategoryExpansion: (categoryId: string) => void;
}) {
  const t = useTranslations('CookieManager');
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.category}
          className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
        >
          <button
            type="button"
            className="p-4 cursor-pointer hover:bg-gray-100 transition-colors w-full text-left"
            onClick={() => toggleCategoryExpansion(category.category)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleCategoryExpansion(category.category);
            }}
            aria-label={`Expand/collapse ${category.category}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedCategory === category.category ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <h4 className="font-medium text-gray-900">{t(category.category)}</h4>
                </div>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {category.cookies?.length} cookies
                </span>
              </div>
              <label
                className="relative inline-flex items-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={cookiePreferences[category.category]}
                  onChange={() => toggleCookieType(category.category)}
                  disabled={category.required}
                />
                <div
                  className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#CF3D45]/50 transition-all
${cookiePreferences[category.category] ? 'bg-[#CF3D45]' : 'bg-gray-200'} 
after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all
${cookiePreferences[category.category] ? 'after:translate-x-full after:border-white' : 'after:border-gray-300'}
${category.required ? 'opacity-60' : ''}`}
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-2 ml-6">{category.description}</p>
          </button>

          {expandedCategory === category.category && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="space-y-3">
                {category.cookies?.map((cookie, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{t('name')}:</span>
                        <span className="ml-2 font-mono text-gray-700 bg-gray-100 px-1 rounded">
                          {cookie.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{t('expires')}:</span>
                        <span className="ml-2 text-gray-700">{cookie.duration}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-900">{t('purpose')}:</span>
                        <span className="ml-2 text-gray-700">{cookie.description}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{t('type')}:</span>
                        <span className="ml-2 text-gray-700">
                          {cookie.type === 'http-cookie' ? 'HTTP Cookie' : 'Local Storage'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{t('vendor')}:</span>
                        <span className="ml-2 text-gray-700">{cookie.vendor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
