import type { BrregCompany } from '@/types/onboarding';
import { type NextRequest, NextResponse } from 'next/server';

interface BrregCompanyExtended extends BrregCompany {
  konkurs: boolean;
  underAvvikling: boolean;
  underTvangsavviklingEllerTvangsopplosning: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'name' or 'orgNumber'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    let url: string;

    if (type === 'orgNumber') {
      // Search by organization number
      url = `https://data.brreg.no/enhetsregisteret/api/enheter/${query}`;
    } else {
      // Search by company name
      url = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(query)}&size=10`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RenVert/1.0 (https://renvert.no)',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      throw new Error(`Brønnøysund API error: ${response.status}`);
    }

    const data = await response.json();

    if (type === 'orgNumber') {
      // Single company result
      if (data.konkurs || data.underAvvikling || data.underTvangsavviklingEllerTvangsopplosning) {
        return NextResponse.json(
          { error: 'Company is not active (bankrupt, under liquidation, etc.)' },
          { status: 400 }
        );
      }

      const company: BrregCompanyExtended = {
        organisasjonsnummer: data.organisasjonsnummer,
        navn: data.navn,
        organisasjonsform: data.organisasjonsform,
        registreringsdatoEnhetsregisteret: data.registreringsdatoEnhetsregisteret,
        hjemmeside: data.hjemmeside,
        postadresse: data.postadresse,
        forretningsadresse: data.forretningsadresse,
        naeringskode1: data.naeringskode1,
        antallAnsatte: data.antallAnsatte,
        konkurs: data.konkurs,
        underAvvikling: data.underAvvikling,
        underTvangsavviklingEllerTvangsopplosning: data.underTvangsavviklingEllerTvangsopplosning,
      };

      return NextResponse.json({ company });
    }
    // Multiple companies result
    const companies =
      data._embedded?.enheter?.map((company: any) => ({
        organisasjonsnummer: company.organisasjonsnummer,
        navn: company.navn,
        organisasjonsform: company.organisasjonsform,
        registreringsdatoEnhetsregisteret: company.registreringsdatoEnhetsregisteret,
        hjemmeside: company.hjemmeside,
        postadresse: company.postadresse,
        forretningsadresse: company.forretningsadresse,
        naeringskode1: company.naeringskode1,
        antallAnsatte: company.antallAnsatte,
        konkurs: company.konkurs,
        underAvvikling: company.underAvvikling,
        underTvangsavviklingEllerTvangsopplosning:
          company.underTvangsavviklingEllerTvangsopplosning,
      })) || [];

    // Filter out inactive companies
    const activeCompanies = companies.filter(
      (company: BrregCompanyExtended) =>
        !company.konkurs &&
        !company.underAvvikling &&
        !company.underTvangsavviklingEllerTvangsopplosning
    );

    // Return only the base BrregCompany fields (without the extended fields)
    const cleanCompanies: BrregCompany[] = activeCompanies.map((company: BrregCompanyExtended) => {
      const {
        konkurs,
        underAvvikling,
        underTvangsavviklingEllerTvangsopplosning,
        ...cleanCompany
      } = company;
      return cleanCompany;
    });

    return NextResponse.json({ companies: cleanCompanies });
  } catch (error) {
    console.error('Brønnøysund API error:', error);
    return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
  }
}
