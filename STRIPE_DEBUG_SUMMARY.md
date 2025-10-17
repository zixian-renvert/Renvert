# Stripe Debugging Solution - Implementation Summary

## What Was Implemented

I've created a comprehensive debugging solution for your Stripe payment capture and payout issues. Here's what's been added:

### 1. **Database Logging System** ✅
- New `stripeLogs` table in Convex schema
- Automatically logs every Stripe operation (capture, payout, transfers)
- Stores request/response data, errors, and timestamps
- Indexed for fast querying by job, operation, and status

### 2. **Enhanced Error Handling** ✅
- Added detailed logging to all Stripe operations
- Better error messages with Stripe error codes
- Pre-flight checks (payment intent status, Connect account status)
- Comprehensive console logging for both success and failure cases

### 3. **Debug Dashboard** ✅
- Web UI at `/stripe-debug` 
- View all operations and errors in real-time
- Manually trigger payment capture or payout for any job
- Expandable request/response data for deep debugging
- Color-coded status indicators (green=success, red=error, yellow=pending)

### 4. **Testing API Endpoints** ✅
- `/api/stripe/debug/test-capture` - Test payment capture
- `/api/stripe/debug/test-payout` - Test payout
- `/api/stripe/debug/logs` - View logs with filters

### 5. **Improved API Routes** ✅
- Enhanced `/api/stripe/capture-payment-intent/route.ts`:
  - Validates payment intent state before capture
  - Detailed logging at every step
  - Better error responses
- Enhanced `/api/stripe/connect/payout/route.ts`:
  - Verifies Connect account before transfer
  - Checks account capabilities
  - Detailed logging

### 6. **Convex Functions** ✅
- New `stripeDebug.ts` with query functions:
  - `getLogsForJob` - All logs for a specific job
  - `getRecentLogs` - Recent operations
  - `getErrorLogs` - Only failed operations
  - `getAllLogs` - Complete log history
- Updated `stripeConnect.ts`:
  - All actions now log their operations
  - Better error handling and validation

## How to Use

### Quick Start

1. **View the Debug Dashboard**:
   ```
   Navigate to: http://localhost:3000/stripe-debug
   ```

2. **Test Payment Capture**:
   - Find a job ID with status `in-progress` and `paymentStatus: 'authorized'`
   - Enter the job ID in the dashboard
   - Click "Test Capture Payment"
   - View the results and logs

3. **Test Payout**:
   - Find a completed job with `paymentStatus: 'paid'`
   - Enter the job ID in the dashboard
   - Click "Test Payout"
   - View the results and logs

### Debugging a Failed Capture

1. Go to `/stripe-debug`
2. Look at "Recent Errors" section
3. Find the `capture_payment` error
4. Check the error message - common issues:
   - "Payment intent is in [status] state" → Payment already captured or not in correct state
   - "No payment intent found" → Missing payment intent ID in job
   - "Job must be in progress" → Job status not set correctly
   - Network errors → Check `NEXT_PUBLIC_BASE_URL` environment variable

### Debugging a Failed Payout

1. Go to `/stripe-debug`
2. Look for `payout` or `payout_to_cleaner` errors
3. Common issues:
   - "Connect account is not active" → Cleaner needs to complete onboarding
   - "Payment must be captured before payout" → Capture the payment first
   - "Cleaner does not have a Stripe Connect account" → Set up Connect account
   - "Account charges not enabled" → Complete Connect onboarding

### Using API Endpoints

```bash
# Test capture for a specific job
curl -X POST http://localhost:3000/api/stripe/debug/test-capture \
  -H "Content-Type: application/json" \
  -d '{"jobId": "kjg123456..."}'

# Test payout
curl -X POST http://localhost:3000/api/stripe/debug/test-payout \
  -H "Content-Type: application/json" \
  -d '{"jobId": "kjg123456..."}'

# View all error logs
curl "http://localhost:3000/api/stripe/debug/logs?errorsOnly=true"

# View logs for specific job
curl "http://localhost:3000/api/stripe/debug/logs?jobId=kjg123456..."
```

## What to Check if Issues Persist

### Payment Capture Not Working

1. **Check Stripe Dashboard**: 
   - Go to https://dashboard.stripe.com/test/payments
   - Find the payment intent
   - Verify its status is `requires_capture`

2. **Check Job Status**:
   - Job must be in `in-progress` status
   - Must have a `stripePaymentIntentId`
   - Payment status should be `authorized` or `pending`

3. **Check Environment Variable**:
   - `NEXT_PUBLIC_BASE_URL` must be set correctly
   - Check Convex logs for the baseUrl value

4. **Check Logs**:
   - Go to `/stripe-debug`
   - Look for `capture_payment` operations
   - Check request/response data

### Payout Not Working

1. **Verify Prerequisites**:
   - Payment must be captured first (`paymentStatus: 'paid'`)
   - Job must be completed (`status: 'completed'`)
   - Cleaner must have Connect account

2. **Check Connect Account**:
   - Go to Stripe Dashboard → Connect → Accounts
   - Find the cleaner's account
   - Verify `charges_enabled: true`
   - Verify `details_submitted: true`

3. **Check Balance**:
   - Platform account must have sufficient balance
   - Transfers happen from platform balance to Connect account

4. **Check Logs**:
   - Look for `payout` and `payout_to_cleaner` operations
   - Review error messages

## Files Modified/Created

### New Files:
- `convex/stripeDebug.ts` - Logging functions
- `src/app/api/stripe/debug/test-capture/route.ts` - Test capture endpoint
- `src/app/api/stripe/debug/test-payout/route.ts` - Test payout endpoint
- `src/app/api/stripe/debug/logs/route.ts` - Logs API
- `src/components/StripeDebugDashboard.tsx` - Debug UI
- `src/app/(frontend)/[locale]/stripe-debug/page.tsx` - Dashboard page
- `STRIPE_DEBUG_GUIDE.md` - Complete debugging guide
- `STRIPE_DEBUG_SUMMARY.md` - This file

### Modified Files:
- `convex/schema.ts` - Added `stripeLogs` table
- `convex/stripeConnect.ts` - Added logging to all operations
- `src/app/api/stripe/capture-payment-intent/route.ts` - Enhanced logging
- `src/app/api/stripe/connect/payout/route.ts` - Enhanced logging
- `src/app/api/stripe/create-payment-intent/route.ts` - Added comments

## Next Steps

1. **Deploy the changes**:
   - Push schema changes to Convex
   - Deploy Next.js app
   - Verify environment variables

2. **Test the flow**:
   - Create a test job
   - Authorize payment (use test card `4242 4242 4242 4242`)
   - Start the job → Check if capture works
   - Complete the job → Check if payout works

3. **Monitor logs**:
   - Check `/stripe-debug` regularly
   - Review error logs
   - Fix any issues found

4. **Production deployment**:
   - Test thoroughly in test mode first
   - Switch to production Stripe keys when ready
   - Monitor logs closely after deployment

## Key Insights

### Why Capture Might Fail:
- Payment intent not in `requires_capture` state
- Payment already captured
- Authorization expired (7 days for cards)
- Network issues reaching the API

### Why Payout Might Fail:
- Payment not captured yet (can't transfer uncaptured funds)
- Connect account not fully onboarded
- Insufficient balance in platform account
- Connect account disabled or restricted

### The Flow:
```
1. Customer pays → Payment authorized (held, not captured)
2. Cleaner starts job → Payment captured (funds move to platform)
3. Cleaner completes job → Transfer created (funds move to Connect account)
4. Stripe processes transfer → Funds appear in cleaner's bank account (2-7 days)
```

## Support

- **Debug Dashboard**: `/stripe-debug`
- **Full Guide**: See `STRIPE_DEBUG_GUIDE.md`
- **Stripe Docs**: https://stripe.com/docs/connect
- **Stripe Dashboard**: https://dashboard.stripe.com

All operations are now logged, so you'll always be able to see exactly what's happening with payments and payouts!

