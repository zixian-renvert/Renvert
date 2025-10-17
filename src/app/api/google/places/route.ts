import { type NextRequest, NextResponse } from 'next/server';

interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface GooglePlacesResult {
  predictions: GooglePlace[];
  status: string;
}

interface AddressSearchResult {
  addresses: Array<{
    id: string;
    displayName: string;
    mainText: string;
    secondaryText: string;
    types: string[];
  }>;
  status: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const sessionToken = searchParams.get('sessionToken') || 'default';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Get Google API key from environment
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('Google Places API key not configured');
    return NextResponse.json({ error: 'Address search service not configured' }, { status: 500 });
  }

  try {
    // Google Places Autocomplete API endpoint with Norway-only restriction
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${new URLSearchParams(
      {
        input: query,
        key: apiKey,
        sessiontoken: sessionToken,
        components: 'country:no', // Restrict to Norway only
        language: 'no', // Norwegian language
        types: 'address', // Only return addresses
      }
    )}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RenVert/1.0 (https://renvert.no)',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API HTTP error:', response.status, errorText);
      throw new Error(`Google Places API HTTP error: ${response.status} - ${errorText}`);
    }

    const data: GooglePlacesResult = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error status:', data.status);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    if (!data.predictions || data.predictions.length === 0) {
      return NextResponse.json({
        addresses: [],
        status: 'ZERO_RESULTS',
      });
    }

    // Transform the data to our format
    const addresses = data.predictions.map((place) => ({
      id: place.place_id,
      displayName: place.description,
      mainText: place.structured_formatting.main_text,
      secondaryText: place.structured_formatting.secondary_text,
      types: place.types,
    }));

    const result: AddressSearchResult = {
      addresses,
      status: data.status,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Google Places API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search addresses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
