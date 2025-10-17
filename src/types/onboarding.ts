export type PropertyType = 'apartment' | 'hytte' | 'office' | 'house' | 'commercial' | 'other';

export interface Property {
  id: string;
  name?: string; // Optional since it will be auto-generated from address
  type: PropertyType;
  address: string;
  postalCode: string;
  city: string;
  size: string;
  unitDetails: string | null;
}

export interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: {
    kode: string;
    beskrivelse: string;
  };
  registreringsdatoEnhetsregisteret: string;
  hjemmeside?: string;
  postadresse?: {
    adresse: string | string[];
    postnummer: string;
    poststed: string;
    land: string;
  };
  forretningsadresse?: {
    adresse: string | string[];
    postnummer: string;
    poststed: string;
    land: string;
  };
  naeringskode1?: {
    kode: string;
    beskrivelse: string;
  };
  antallAnsatte?: number;
}

export type UserType = 'landlord' | 'cleaner' | null;
export type LandlordType = 'private' | 'company' | null;
