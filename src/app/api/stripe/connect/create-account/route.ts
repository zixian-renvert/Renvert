import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email, country = 'NO', type = 'express' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create a Connect account for the cleaner
    const account = await stripe.accounts.create({
      type: type as 'express' | 'standard',
      country: country as string,
      email: email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        url: 'https://renvert.no', // Use production URL for Stripe Connect
        mcc: '7299', // Personal Care Services
      },
    });

    return NextResponse.json({
      accountId: account.id,
      accountStatus: account.charges_enabled ? 'active' : 'pending',
    });
  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json({ 
      error: 'Failed to create Connect account',
      details: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    }, { status: 500 });
  }
}
