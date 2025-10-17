import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYOUT API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const { accountId, amount, currency = 'nok', description, metadata } = await request.json();

    console.log('Payout request:', {
      accountId,
      amount,
      currency,
      description,
      metadata,
    });

    if (!accountId || !amount) {
      console.log('ERROR: Missing required fields');
      return NextResponse.json({ error: 'Account ID and amount are required' }, { status: 400 });
    }

    // First, verify the Connect account exists and is active
    console.log('Verifying Connect account:', accountId);
    try {
      const account = await stripe.accounts.retrieve(accountId);
      console.log('Connect account status:', {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      });

      if (!account.charges_enabled) {
        console.log('ERROR: Account charges not enabled');
        return NextResponse.json({ 
          error: 'Connect account is not enabled for charges. Please complete onboarding.' 
        }, { status: 400 });
      }
    } catch (accountError) {
      console.error('ERROR: Failed to retrieve account:', accountError);
      return NextResponse.json({ 
        error: 'Connect account not found or invalid' 
      }, { status: 400 });
    }

    // Create a transfer to the cleaner's Connect account
    console.log('Creating transfer...');
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: accountId,
      description: description || 'Cleaning service payment',
      metadata: metadata || {},
    });

    console.log('=== TRANSFER CREATED SUCCESSFULLY ===');
    console.log('Transfer ID:', transfer.id);
    console.log('Transfer amount:', transfer.amount);
    console.log('Transfer status:', transfer.object);

    return NextResponse.json({
      transferId: transfer.id,
      amount: transfer.amount / 100, // Convert back from cents
      currency: transfer.currency,
      object: transfer.object, // Use object type
    });
  } catch (error) {
    console.error('=== ERROR CREATING TRANSFER ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error details:', error);

    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error code:', error.code);
      console.error('Stripe error message:', error.message);
      console.error('Stripe error type:', error.type);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        type: error.type
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
