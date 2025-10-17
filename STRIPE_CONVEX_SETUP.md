# Stripe + Convex Setup Guide

## Problem Solved

**Before:** Convex actions were trying to call `http://localhost:3000` which doesn't work because Convex runs in the cloud, not on your local machine. This caused the "forbidden" error.

**After:** Stripe SDK is now called **directly from Convex actions**, eliminating the need to proxy through Next.js API routes.

## Setup Steps

### 1. Install Dependencies in Convex

The Stripe SDK needs to be installed in your Convex functions:

```bash
cd convex
npm install stripe
cd ..
```

Or if you use pnpm (from the root):

```bash
pnpm install --filter ./convex stripe
```

### 2. Set Environment Variables in Convex

Convex needs access to your Stripe secret key. You have two options:

#### Option A: Using Convex Dashboard (Recommended)

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
5. Click **Save**

#### Option B: Using Convex CLI

```bash
npx convex env set STRIPE_SECRET_KEY sk_test_your_key_here
```

### 3. Push Schema Changes

The new `stripeLogs` table needs to be pushed to Convex:

```bash
npx convex dev
```

This will detect the schema changes and prompt you to push them.

### 4. Verify Setup

Check that everything is working:

```bash
# In your terminal, you should see:
# === STRIPE CONNECT DEBUG ===
# STRIPE_SECRET_KEY exists: true
```

## How It Works Now

### Payment Capture Flow

```
1. User starts job
   ↓
2. Convex action: capturePaymentForJob
   ↓
3. Direct Stripe SDK call: stripe.paymentIntents.capture()
   ↓
4. Payment captured to platform account
   ↓
5. Job payment status → 'paid'
   ↓
6. Everything logged to stripeLogs table
```

### Payout Flow

```
1. User completes job
   ↓
2. Convex action: payoutForCompletedJob
   ↓
3. Direct Stripe SDK call: stripe.transfers.create()
   ↓
4. Transfer created from platform to Connect account
   ↓
5. Job payout status → 'paid'
   ↓
6. Everything logged to stripeLogs table
```

## Debugging

All operations are now logged with extensive detail:

```typescript
// View logs in Convex dashboard or via API
console.log('=== PAYMENT CAPTURE STARTED ===');
console.log('Job ID:', jobId);
console.log('Payment intent status:', paymentIntent.status);
console.log('=== PAYMENT CAPTURED SUCCESSFULLY ===');
```

### View Logs

1. **Convex Dashboard Logs**: 
   - Go to https://dashboard.convex.dev
   - Select your project
   - Click **Logs**
   - You'll see all console.log statements

2. **Database Logs**:
   - Go to `/stripe-debug` in your app
   - See all Stripe operations with details

3. **Stripe Dashboard**:
   - https://dashboard.stripe.com/test/logs
   - See all API calls from Convex

## Common Issues

### Issue: "Stripe is not defined" error

**Solution:** Make sure you've run `npm install stripe` in the convex directory.

### Issue: "STRIPE_SECRET_KEY is undefined"

**Solution:** Set the environment variable in Convex dashboard or CLI (see step 2 above).

### Issue: "Payment intent is in X state"

**Debug:**
1. Check Stripe Dashboard for payment intent
2. View logs in `/stripe-debug`
3. Check console logs in Convex dashboard

### Issue: "Connect account not found"

**Debug:**
1. Verify cleaner has `stripeConnectAccountId` set
2. Check cleaner's Connect account in Stripe Dashboard
3. Ensure Connect account is fully onboarded

## Testing

### Local Development

```bash
# Start Convex dev server
npx convex dev

# In another terminal, start Next.js
npm run dev
```

Now when you test:
1. Convex actions will call Stripe directly (no localhost issues!)
2. All operations are logged to console and database
3. Check logs in real-time in Convex dashboard

### Test the Fix

1. Create a test job
2. Start the job as cleaner
3. Check Convex logs:
   ```
   === PAYMENT CAPTURE STARTED ===
   Job ID: kjg...
   Payment intent retrieved: { id: 'pi_...', status: 'requires_capture' }
   === PAYMENT CAPTURED SUCCESSFULLY ===
   ```
4. Go to `/stripe-debug` to see the logged operation

## Advantages of This Approach

✅ **No localhost issues** - Convex calls Stripe API directly
✅ **Faster** - No HTTP round-trip through Next.js
✅ **Simpler** - Less code, fewer failure points
✅ **Better logging** - All Stripe SDK errors are captured
✅ **Easier debugging** - Console logs in Convex dashboard

## Environment Variables Summary

### Convex (Backend)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_test_... or sk_live_...)

### Next.js (Frontend)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (pk_test_... or pk_live_...)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (for Next.js API routes that still need it)
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL

## Next Steps

1. ✅ Install Stripe in Convex
2. ✅ Set STRIPE_SECRET_KEY in Convex
3. ✅ Push schema changes
4. ✅ Test payment capture
5. ✅ Test payout
6. ✅ Monitor logs in `/stripe-debug`

You're all set! The localhost issue is now fixed, and you have full debugging capabilities.

