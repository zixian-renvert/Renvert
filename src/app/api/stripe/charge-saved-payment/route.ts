import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'nok',
      customerId,
      paymentMethodId,
      metadata,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Customer ID and Payment Method ID are required' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent using the saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true, // Charge without user interaction
      confirm: true, // Confirm immediately
      metadata: {
        ...metadata,
        customerId,
        paymentMethodId,
      },
    });

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Error charging saved payment method:', error);

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'authentication_required') {
        return NextResponse.json(
          { error: 'Payment requires authentication. Please use a new payment method.' },
          { status: 400 }
        );
      }
      if (error.code === 'card_declined') {
        return NextResponse.json(
          { error: 'Payment was declined. Please try a different payment method.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to charge payment method' }, { status: 500 });
  }
}
