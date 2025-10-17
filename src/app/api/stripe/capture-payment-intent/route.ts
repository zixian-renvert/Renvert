import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT CAPTURE API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Check if request body exists
    const body = await request.text();
    console.log('Request body:', body);
    
    if (!body) {
      console.log('ERROR: Empty request body');
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }
    
    const { paymentIntentId, amountToCapture, idempotencyKey } = JSON.parse(body);
    
    console.log('Payment capture request:', {
      paymentIntentId,
      amountToCapture,
      idempotencyKey,
    });

    if (!paymentIntentId) {
      console.log('ERROR: Missing paymentIntentId');
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
    }

    // First, retrieve the payment intent to check its status
    console.log('Retrieving payment intent:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);
    console.log('Payment intent amount:', paymentIntent.amount);
    console.log('Payment intent currency:', paymentIntent.currency);

    if (paymentIntent.status === 'succeeded') {
      console.log('Payment already captured');
      return NextResponse.json({ 
        id: paymentIntent.id, 
        status: paymentIntent.status,
        message: 'Payment already captured'
      });
    }

    if (paymentIntent.status !== 'requires_capture') {
      console.log('ERROR: Payment intent not in capturable state');
      return NextResponse.json({ 
        error: `Payment intent is in ${paymentIntent.status} state, cannot capture`,
        currentStatus: paymentIntent.status 
      }, { status: 400 });
    }

    console.log('Capturing payment intent...');
    const capture = await stripe.paymentIntents.capture(
      paymentIntentId,
      {
        amount_to_capture: amountToCapture ? Math.round(amountToCapture * 100) : undefined,
      },
      {
        idempotencyKey: idempotencyKey || `pi_${paymentIntentId}_start_capture`,
      }
    );

    console.log('=== PAYMENT CAPTURED SUCCESSFULLY ===');
    console.log('Capture ID:', capture.id);
    console.log('Capture status:', capture.status);
    console.log('Captured amount:', capture.amount);
    
    return NextResponse.json({ 
      id: capture.id, 
      status: capture.status,
      amount: capture.amount / 100,
      currency: capture.currency
    });
  } catch (error) {
    console.error('=== ERROR CAPTURING PAYMENT INTENT ===');
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
      error: 'Failed to capture payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
