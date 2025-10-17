import { type NextRequest, NextResponse } from 'next/server';

interface GooglePlaceDetails {
  place_id: string;
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface GooglePlaceDetailsResult {
  result: GooglePlaceDetails;
  status: string;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID parameter is required' }, { status: 400 });
  }

  // Get Google API key from environment
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('Google Places API key not configured');
    return NextResponse.json({ error: 'Address service not configured' }, { status: 500 });
  }

  try {
    // Google Places Details API endpoint
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: 'place_id,formatted_address,address_components,geometry,types',
      language: 'no', // Norwegian language
    })}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RenVert/1.0 (https://renvert.no)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data: GooglePlaceDetailsResult = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const place = data.result;

    // Extract address components
    const addressComponents = place.address_components;
    const streetNumber =
      addressComponents.find((comp) => comp.types.includes('street_number'))?.long_name || '';
    const streetName =
      addressComponents.find((comp) => comp.types.includes('route'))?.long_name || '';
    const postalCode =
      addressComponents.find((comp) => comp.types.includes('postal_code'))?.long_name || '';
    const city = addressComponents.find((comp) => comp.types.includes('locality'))?.long_name || '';
    const municipality =
      addressComponents.find((comp) => comp.types.includes('administrative_area_level_2'))
        ?.long_name || '';
    const county =
      addressComponents.find((comp) => comp.types.includes('administrative_area_level_1'))
        ?.long_name || '';
    const country =
      addressComponents.find((comp) => comp.types.includes('country'))?.long_name || '';

    // Validate that this is a Norwegian address
    if (country !== 'Norge' && country !== 'Norway') {
      console.error('Non-Norwegian address attempted:', country);
      return NextResponse.json(
        { error: 'Only Norwegian addresses are supported' },
        { status: 400 }
      );
    }

    const addressDetails: AddressDetails = {
      id: place.place_id,
      formattedAddress: place.formatted_address,
      streetNumber,
      streetName,
      postalCode,
      city,
      municipality,
      county,
      country,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      types: place.types,
    };

    return NextResponse.json(addressDetails);
  } catch (error) {
    console.error('Google Places Details API error:', error);
    return NextResponse.json({ error: 'Failed to get address details' }, { status: 500 });
  }
}
