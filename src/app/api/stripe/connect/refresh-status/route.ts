import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { api } from '../../../../../../convex/_generated/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Get current account status from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    const status = account.charges_enabled
      ? 'active'
      : account.requirements?.disabled_reason
        ? 'restricted'
        : 'pending';

    // Extract bank details if available
    let bankAccountDetails: { last4: string; bankName: string; accountType: string } | undefined;
    const externalAccounts = (account.external_accounts as any)?.data as any[] | undefined;
    const defaultBank = externalAccounts?.find((acc: any) => acc.object === 'bank_account');
    if (defaultBank) {
      bankAccountDetails = {
        last4: defaultBank.last4,
        bankName: defaultBank.bank_name,
        accountType: defaultBank.account_holder_type || 'individual',
      };
    }

    // Update Convex with current status
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const result = await convex.mutation(api.stripeConnect.updateConnectAccountStatusByAccountId, {
      accountId: account.id,
      status: status as 'pending' | 'active' | 'restricted' | 'disabled',
      bankAccountDetails,
    });

    return NextResponse.json({
      success: true,
      status,
      bankAccountDetails,
      convexResult: result,
    });
  } catch (error) {
    console.error('Error refreshing Connect account status:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to refresh account status' }, { status: 500 });
  }
}
