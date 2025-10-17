'use client';

// Disable static generation for this page since it uses Convex
export const dynamic = 'force-dynamic';

import {
  CleanerStep3,
  LandlordStep3,
  OnboardingNavigation,
  OnboardingProgress,
  OnboardingStep1,
  OnboardingStep2,
} from '@/components/onboarding';
import {
  type BrregCompany,
  type LandlordType,
  type Property,
  PropertyType,
  type UserType,
} from '@/types/onboarding';
import { useAuth, useUser } from '@clerk/nextjs';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { api } from '../../../../../convex/_generated/api';
// Phone validation removed for simplicity

interface OnboardingData {
  userType: UserType;
  name: string;
  phone: string;
  email: string;

  // Landlord-specific
  landlordType: LandlordType;
  selectedCompany: BrregCompany | null;
  companyName: string;
  organizationNumber: string;
  companyAddress: string;
  properties: Property[];

  // Cleaner-specific
  cleanerCompanyName: string;
  cleanerOrganizationNumber: string;
  hmsCardFile: File | null;
  experience: string;
  availability: string;
  services: string[];
  hourlyRate: string;
  certifications: string[];

  // Terms and conditions
  termsAccepted: boolean;
}

export default function OnboardingPage() {
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const t = useTranslations('onboarding');
  const locale = useLocale();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: null,
    name: user?.fullName || '',
    phone: '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    landlordType: null,
    selectedCompany: null,
    companyName: '',
    organizationNumber: '',
    companyAddress: '',
    properties: [],
    cleanerCompanyName: '',
    cleanerOrganizationNumber: '',
    hmsCardFile: null,
    experience: '',
    availability: '',
    services: [],
    hourlyRate: '',
    certifications: [],
    termsAccepted: false,
  });
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      setOnboardingData((prev) => ({ ...prev, name: user.fullName || '', email: user.primaryEmailAddress?.emailAddress || '' }));
    }
  }, [isLoaded]);

  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const generateUploadUrl = useAction(api.fileStorage.generateUploadUrl);

  // Get user data to check if already onboarded - only when userId is available
  const dbUsers = useQuery(api.users.getUsers, userId ? {} : 'skip');
  const dbUser = dbUsers?.find((user: any) => user.userId === userId);

  // Redirect if already onboarded
  useEffect(() => {
    if (dbUser?.onboarded) {
      router.push(`/${locale}/dashboard`);
    }
  }, [dbUser?.onboarded, router, locale]);

  // Zod schemas
  const baseSchema = z.object({
    name: z.string().trim().min(1, t('validation.name-required')),
    phone: z.string().trim().min(8, t('validation.phone-invalid')),
    email: z.string().email().optional(),
    userType: z.enum(['landlord', 'cleaner']).nullable(),
  });

  const propertySchema = z
    .object({
      id: z.string(),
      type: z.enum(['apartment', 'hytte', 'office', 'house', 'commercial', 'other']),
      address: z.string().trim().min(1, t('validation.property-address-required')),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      size: z
        .string()
        .trim()
        .min(1, t('validation.property-size-required'))
        .refine((v: string) => Number.parseFloat(v) > 0, t('validation.property-size-invalid')),
      unitDetails: z.string().nullable().optional(),
    })
    .superRefine((val, ctx) => {
      const n = Number.parseFloat(val.size);
      if (!Number.isFinite(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.property-size-invalid'),
        });
        return;
      }
      // Logical ranges by property type
      const min = 10;
      let max = 1000;
      if (val.type === 'apartment' || val.type === 'house' || val.type === 'hytte') {
        max = 300; // Updated to match pricing tiers (0-300 sqm)
      } else if (val.type === 'office' || val.type === 'commercial') {
        max = 5000;
      } else {
        max = 2000;
      }
      if (n < min || n > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.property-size-out-of-range', { min, max }),
          path: ['size'],
        });
      }
    });

  const landlordSchema = baseSchema.extend({
    userType: z
      .literal('landlord')
      .nullable()
      .transform(() => 'landlord' as const),
    landlordType: z.enum(['private', 'company']).nullable(),
    selectedCompany: z.any().nullable().optional(),
    properties: z.array(propertySchema).min(1, t('validation.properties-required')),
    termsAccepted: z.boolean().refine((val) => val === true, t('validation.terms-required')),
  });

  const cleanerSchema = baseSchema.extend({
    userType: z
      .literal('cleaner')
      .nullable()
      .transform(() => 'cleaner' as const),
    selectedCompany: z
      .unknown()
      .nullable()
      .refine((v) => v != null, t('validation.company-required')),
    experience: z.string().trim().min(20, t('validation.cleaner-experience-required')),
    hmsCardFile: z
      .unknown()
      .nullable()
      .refine((v) => v != null, t('validation.hms-file-required')),
    termsAccepted: z.boolean().refine((val) => val === true, t('validation.terms-required')),
  });

  const validationResult = useMemo(() => {
    try {
      if (currentStep === 1) {
        baseSchema.pick({ name: true, phone: true }).parse(onboardingData);
      } else if (currentStep === 2) {
        baseSchema.pick({ userType: true }).parse(onboardingData);
      } else if (currentStep === 3) {
        if (onboardingData.userType === 'landlord') {
          landlordSchema.parse(onboardingData);
        } else if (onboardingData.userType === 'cleaner') {
          cleanerSchema.parse(onboardingData);
        }
      }
      return { ok: true as const, msg: null as string | null };
    } catch (e) {
      const err = e as any;
      const msg = err?.errors?.[0]?.message || 'Invalid form data';
      return { ok: false as const, msg };
    }
  }, [currentStep, onboardingData]);

  const canProceed = validationResult.ok;

  // Build field-level errors for current step from Zod
  const fieldErrors = useMemo(() => {
    const errors: any = {};
    const pushIssue = (path: (string | number | symbol)[], message: string) => {
      // properties.0.size → errors.properties[0].size
      if (path[0] === 'properties' && typeof path[1] === 'number') {
        const index = path[1] as number;
        if (!errors.properties) errors.properties = [];
        if (!errors.properties[index]) errors.properties[index] = {};
        const key = String(path[2] ?? '');
        if (key) errors.properties[index][key] = message;
      } else if (path[0] === 'experience') {
        errors.experience = message;
      } else if (path[0] === 'selectedCompany') {
        errors.selectedCompany = message;
      } else if (path[0] === 'hmsCardFile') {
        errors.hmsCardFile = message;
      } else if (path[0] === 'termsAccepted') {
        errors.termsAccepted = message;
      } else if (path[0] === 'name' || path[0] === 'phone' || path[0] === 'userType') {
        errors[String(path[0])] = message;
      }
    };

    const run = () => {
      if (currentStep === 1) {
        const r = baseSchema.pick({ name: true, phone: true }).safeParse(onboardingData);
        if (!r.success) r.error.issues.forEach((i) => pushIssue(i.path as any, i.message));
      } else if (currentStep === 2) {
        const r = baseSchema.pick({ userType: true }).safeParse(onboardingData);
        if (!r.success) r.error.issues.forEach((i) => pushIssue(i.path as any, i.message));
      } else if (currentStep === 3) {
        if (onboardingData.userType === 'landlord') {
          const r = landlordSchema.safeParse(onboardingData);
          if (!r.success) r.error.issues.forEach((i) => pushIssue(i.path as any, i.message));
        } else if (onboardingData.userType === 'cleaner') {
          const r = cleanerSchema.safeParse(onboardingData);
          if (!r.success) r.error.issues.forEach((i) => pushIssue(i.path as any, i.message));
        }
      }
    };
    run();
    return errors as {
      name?: string;
      phone?: string;
      userType?: string;
      properties?: Array<{ address?: string; size?: string }>;
      selectedCompany?: string;
      experience?: string;
      hmsCardFile?: string;
      termsAccepted?: string;
    };
  }, [currentStep, onboardingData, baseSchema, landlordSchema, cleanerSchema]);

  // Function to clear role-specific data when switching roles
  const clearRoleData = () => {
    setOnboardingData((prev) => ({
      ...prev,
      // Clear landlord data
      landlordType: null,
      selectedCompany: null,
      companyName: '',
      organizationNumber: '',
      companyAddress: '',
      properties: [],
      // Clear cleaner data
      cleanerCompanyName: '',
      cleanerOrganizationNumber: '',
      hmsCardFile: null,
      // Reset terms acceptance when switching roles
      termsAccepted: false,
    }));
  };

  // Event handlers
  const handleUserTypeSelect = (userType: UserType) => {
    // Clear previous role data when switching
    clearRoleData();

    // If landlord is selected, automatically add one property
    if (userType === 'landlord') {
      const initialProperty: Property = {
        id: Date.now().toString(),
        type: 'apartment',
        address: '',
        postalCode: '', // Will be filled from address search
        city: '', // Will be filled from address search
        size: '',
        unitDetails: null,
      };
      setOnboardingData((prev) => ({
        ...prev,
        userType,
        properties: [initialProperty],
      }));
    } else {
      setOnboardingData((prev) => ({
        ...prev,
        userType,
      }));
    }

    setCurrentStep(3);
  };

  const handleInputChange = (field: 'name' | 'phone', value: string) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLandlordInputChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  const _handleCleanerInputChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanySelect = (company: BrregCompany | null) => {
    setOnboardingData((prev) => ({
      ...prev,
      selectedCompany: company,
      companyName: company?.navn || '',
      organizationNumber: company?.organisasjonsnummer || '',
      companyAddress: company
        ? company.forretningsadresse
          ? `${Array.isArray(company.forretningsadresse.adresse) ? company.forretningsadresse.adresse.join(', ') : company.forretningsadresse.adresse}, ${company.forretningsadresse.postnummer} ${company.forretningsadresse.poststed}, ${company.forretningsadresse.land}`
          : company.postadresse
            ? `${Array.isArray(company.postadresse.adresse) ? company.postadresse.adresse.join(', ') : company.postadresse.adresse}, ${company.postadresse.postnummer} ${company.postadresse.poststed}, ${company.postadresse.land}`
            : ''
        : '',
      cleanerCompanyName: company?.navn || '',
      cleanerOrganizationNumber: company?.organisasjonsnummer || '',
    }));
  };

  const addProperty = () => {
    const newProperty: Property = {
      id: Date.now().toString(),
      type: 'apartment',
      address: '',
      postalCode: '',
      city: '',
      size: '',
      unitDetails: null,
    };
    setOnboardingData((prev) => ({
      ...prev,
      properties: [...prev.properties, newProperty],
    }));
  };

  const updateProperty = (id: string, field: keyof Property, value: any) => {
    setOnboardingData((prev) => ({
      ...prev,
      properties: prev.properties.map((prop) =>
        prop.id === id ? { ...prop, [field]: value } : prop
      ),
    }));
  };

  const removeProperty = (id: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      properties: prev.properties.filter((prop) => prop.id !== id),
    }));
  };

  const handleHMSFileSelect = async (file: File) => {
    // Store the File object for preview and later upload
    setOnboardingData((prev) => ({ ...prev, hmsCardFile: file }));
    setError(null);
  };

  // Validation and navigation
  const validateCurrentStep = () => {
    try {
      if (currentStep === 1) {
        baseSchema.pick({ name: true, phone: true }).parse(onboardingData);
      } else if (currentStep === 2) {
        baseSchema.pick({ userType: true }).parse(onboardingData);
      } else if (currentStep === 3) {
        if (onboardingData.userType === 'landlord') {
          landlordSchema.parse(onboardingData);
        } else if (onboardingData.userType === 'cleaner') {
          cleanerSchema.parse(onboardingData);
        }
      }
      setError(null);
      return true;
    } catch (e) {
      const err = e as any;
      const msg = err?.errors?.[0]?.message || 'Invalid form data';
      setError(msg);
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // If going back from role-specific step, clear role-specific data
      clearRoleData();
    }
    setCurrentStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (userId && onboardingData.userType) {
        // Prepare company data if applicable
        const companyData = onboardingData.selectedCompany
          ? {
              organizationNumber: onboardingData.selectedCompany.organisasjonsnummer,
              name: onboardingData.selectedCompany.navn,
              organizationForm: onboardingData.selectedCompany.organisasjonsform?.kode || null,
              businessAddress: onboardingData.selectedCompany.forretningsadresse
                ? {
                    address: Array.isArray(
                      onboardingData.selectedCompany.forretningsadresse.adresse
                    )
                      ? onboardingData.selectedCompany.forretningsadresse.adresse
                      : onboardingData.selectedCompany.forretningsadresse.adresse,
                    postalCode: onboardingData.selectedCompany.forretningsadresse.postnummer,
                    city: onboardingData.selectedCompany.forretningsadresse.poststed,
                    country: onboardingData.selectedCompany.forretningsadresse.land,
                  }
                : null,
            }
          : undefined;

        // Prepare landlord data if applicable
        const landlordData =
          onboardingData.userType === 'landlord'
            ? {
                landlordType: onboardingData.landlordType!,
                properties: onboardingData.properties.map((prop) => ({
                  name: prop.address || 'Property', // Generate name from address or use default
                  type: prop.type,
                  address: prop.address,
                  postalCode: prop.postalCode,
                  city: prop.city,
                  size: prop.size,
                  unitDetails: prop.unitDetails,
                })),
              }
            : undefined;

        // Prepare cleaner data if applicable
        let cleanerData: any;
        if (onboardingData.userType === 'cleaner' && onboardingData.hmsCardFile) {
          // Upload file to Convex storage
          const uploadUrl = await generateUploadUrl();

          // Upload the file to Convex storage
          const uploadResult = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': onboardingData.hmsCardFile.type },
            body: onboardingData.hmsCardFile,
          });

          if (!uploadResult.ok) {
            throw new Error('Failed to upload file');
          }

          // Get the storage ID from the upload result
          const { storageId } = await uploadResult.json();

          cleanerData = {
            hmsCardFileId: storageId, // Store the storage ID reference
          };
        }

        await completeOnboarding({
          userId,
          userType: onboardingData.userType,
          name: onboardingData.name,
          phone: onboardingData.phone.trim(),
          companyData,
          landlordData,
          cleanerData,
        });

        // Determine dashboard URL based on current locale context
        const dashboardUrl = locale === 'nb' ? '/dashboard' : `/${locale}/dashboard`;
        router.push(dashboardUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep2
            name={onboardingData.name}
            phone={onboardingData.phone}
            email={onboardingData.email}
            onInputChange={handleInputChange}
          />
        );

      case 2:
        return <OnboardingStep1 onUserTypeSelect={handleUserTypeSelect} />;

      case 3:
        if (onboardingData.userType === 'landlord') {
          return (
            <LandlordStep3
              landlordType={onboardingData.landlordType}
              selectedCompany={onboardingData.selectedCompany}
              properties={onboardingData.properties}
              termsAccepted={onboardingData.termsAccepted}
              onLandlordTypeChange={(type) => handleLandlordInputChange('landlordType', type)}
              onCompanySelect={handleCompanySelect}
              onAddProperty={addProperty}
              onUpdateProperty={updateProperty}
              onRemoveProperty={removeProperty}
              onTermsChange={(accepted) => setOnboardingData((prev) => ({ ...prev, termsAccepted: accepted }))}
            />
          );
        }

        if (onboardingData.userType === 'cleaner') {
          return (
            <CleanerStep3
              selectedCompany={onboardingData.selectedCompany}
              hmsCardFile={onboardingData.hmsCardFile}
              experience={onboardingData.experience}
              termsAccepted={onboardingData.termsAccepted}
              onCompanySelect={handleCompanySelect}
              onHMSFileSelect={handleHMSFileSelect}
              onHMSFileRemove={() => setOnboardingData((prev) => ({ ...prev, hmsCardFile: null }))}
              onInputChange={(field, value) =>
                setOnboardingData((prev) => ({ ...prev, [field]: value }))
              }
              onTermsChange={(accepted) => setOnboardingData((prev) => ({ ...prev, termsAccepted: accepted }))}
            />
          );
        }

        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12">
          {/* Progress bar */}
          <OnboardingProgress currentStep={currentStep} totalSteps={3} />

          {/* Form content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-8"
          >
            {renderCurrentStep()}
            {/* Dispatch field-level errors for child components */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dispatchEvent(new CustomEvent('onboarding:fieldErrors', { detail: ${JSON.stringify(
                  {
                    properties: fieldErrors.properties || [],
                    experience: fieldErrors.experience || null,
                    hmsCardFile: fieldErrors.hmsCardFile || null,
                    termsAccepted: fieldErrors.termsAccepted || null,
                  }
                )} }));`,
              }}
            />

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={3}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              canProceed={canProceed}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
