import { ConvexHttpClient } from 'convex/browser';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    console.log(
      'Webhook received event:',
      event.type,
      'for object:',
      (event.data.object as any).id || 'unknown'
    );

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log('Account updated webhook:', {
          accountId: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          requirements: account.requirements,
        });

        const status = account.charges_enabled
          ? 'active'
          : account.requirements?.disabled_reason
            ? 'restricted'
            : 'pending';

        console.log('Determined status:', status);

        // Extract bank details if available
        let bankAccountDetails:
          | { last4: string; bankName: string; accountType: string }
          | undefined;
        const externalAccounts = (account.external_accounts as any)?.data as any[] | undefined;
        const defaultBank = externalAccounts?.find((acc) => acc.object === 'bank_account');
        if (defaultBank) {
          bankAccountDetails = {
            last4: defaultBank.last4,
            bankName: defaultBank.bank_name,
            accountType: defaultBank.account_holder_type || 'individual',
          };
          console.log('Found bank details:', bankAccountDetails);
        } else {
          console.log('No bank account found in external_accounts');
        }

        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        const result = await convex.mutation(
          api.stripeConnect.updateConnectAccountStatusByAccountId,
          {
            accountId: account.id,
            status: status as 'pending' | 'active' | 'restricted' | 'disabled',
            bankAccountDetails,
          }
        );

        console.log('Convex update result:', result);
        break;
      }
      case 'payment_intent.succeeded': {
        const _paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Here you would update your database to mark the booking as paid
        // You can access metadata from paymentIntent.metadata
        break;
      }

      case 'payment_intent.payment_failed': {
        const _failedPayment = event.data.object as Stripe.PaymentIntent;
        // Here you would update your database to mark the booking as failed
        break;
      }

      default:
        // Unhandled event type - log for monitoring but don't fail
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
