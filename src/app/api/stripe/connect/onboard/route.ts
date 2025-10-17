import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { accountId, returnUrl } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/cleaner/onboarding`,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/cleaner/onboarding`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    return NextResponse.json({
      accountLink: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json({ error: 'Failed to create account link' }, { status: 500 });
  }
}
