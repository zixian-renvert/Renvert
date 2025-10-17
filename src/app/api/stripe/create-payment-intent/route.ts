import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'nok',
      metadata,
      customerId,
      setup_future_usage,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Extract email from metadata
    const customerEmail = metadata?.email || 'customer@example.com';

    // Create or get customer
    let customer: Stripe.Customer;
    if (customerId) {
      // Use existing customer
      customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    } else {
      // Create new customer with email
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          serviceType: metadata?.serviceType || '',
          propertyName: metadata?.propertyName || '',
        },
      });
    }

    // Create a PaymentIntent with manual capture so funds are authorized now and captured after completion
    // Note: For Stripe Connect, the payment goes to the platform account first,
    // then we use transfers to send to the Connect account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customer.id,
      metadata: {
        ...metadata,
        customerId: customer.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
      setup_future_usage: setup_future_usage || undefined, // 'off_session' for future payments
      // The payment is captured to the platform account
      // Transfers to Connect accounts happen separately after capture
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
