import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { stripeCustomerId } = await request.json();
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Missing stripeCustomerId' }, { status: 400 });
    }

    await stripe.customers.del(stripeCustomerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stripe customer delete error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
