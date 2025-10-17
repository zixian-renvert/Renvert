# Stripe Payment & Payout Debugging Guide

## Overview

This guide helps you debug Stripe payment capture and payout issues in the RenVert application. We've implemented comprehensive logging and testing tools to make debugging easier.

## Quick Access

- **Debug Dashboard**: Visit `/stripe-debug` to access the debugging dashboard
- **API Logs**: All Stripe operations are logged to the `stripeLogs` database table

## Architecture

### Payment Flow

1. **Authorization** (When job is created):
   - Customer pays via Stripe Elements
   - Payment is **authorized** but NOT captured (`capture_method: 'manual'`)
   - Payment Intent ID is stored with the job
   - Status: `paymentStatus: 'authorized'`

2. **Capture** (When cleaner starts the job):
   - Cleaner clicks "Start Job"
   - Triggers `startJobAndCapturePayment` action
   - Calls `/api/stripe/capture-payment-intent`
   - Funds are captured to the platform account
   - Status: `paymentStatus: 'paid'`

3. **Transfer** (When cleaner completes the job):
   - Cleaner clicks "Complete Job"
   - Triggers `completeJobAndPayout` action
   - Calls `/api/stripe/connect/payout`
   - Creates a Stripe Transfer to cleaner's Connect account
   - Status: `payoutStatus: 'paid'`

### Stripe Connect Setup

- **Platform Account**: Your main Stripe account receives all payments
- **Connect Accounts**: Each cleaner has an Express Connect account
- **Transfers**: After capture, funds are transferred from platform to Connect accounts

## Debugging Tools

### 1. Debug Dashboard (`/stripe-debug`)

Access this page to:
- View all Stripe operation logs
- See recent errors
- Manually test payment capture and payouts
- View detailed request/response data

### 2. API Endpoints

#### Test Payment Capture
```bash
curl -X POST http://localhost:3000/api/stripe/debug/test-capture \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'
```

#### Test Payout
```bash
curl -X POST http://localhost:3000/api/stripe/debug/test-payout \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'
```

#### View Logs
```bash
# All logs
curl http://localhost:3000/api/stripe/debug/logs

# Logs for specific job
curl http://localhost:3000/api/stripe/debug/logs?jobId=YOUR_JOB_ID

# Errors only
curl http://localhost:3000/api/stripe/debug/logs?errorsOnly=true

# Specific operation
curl http://localhost:3000/api/stripe/debug/logs?operation=capture_payment
```

### 3. Database Logs

The `stripeLogs` table stores:
- **operation**: Type of operation (`capture_payment`, `payout`, `payout_to_cleaner`)
- **status**: `pending`, `success`, or `error`
- **jobId**: Related cleaning job
- **paymentIntentId**: Stripe Payment Intent ID
- **transferId**: Stripe Transfer ID (for payouts)
- **accountId**: Stripe Connect account ID
- **amount**: Transaction amount
- **errorMessage**: Error details if failed
- **requestData**: JSON request sent to Stripe
- **responseData**: JSON response from Stripe
- **createdAt**: Timestamp

## Common Issues & Solutions

### Issue 1: Payment Capture Fails

**Symptoms:**
- Job starts but payment status stays `authorized`
- Error: "Payment intent is in [status] state, cannot capture"

**Debugging Steps:**
1. Check the payment intent status in Stripe Dashboard
2. View logs in debug dashboard: `/stripe-debug`
3. Look for the `capture_payment` operation logs
4. Check the error message for specific details

**Common Causes:**
- Payment intent already captured
- Payment intent cancelled or expired
- Insufficient funds (authorization failed)
- Payment method requires action

**Solutions:**
```typescript
// Check payment intent status in Stripe
const paymentIntent = await stripe.paymentIntents.retrieve('pi_xxx');
console.log(paymentIntent.status);
// Should be 'requires_capture' for capture to work
```

### Issue 2: Payout Fails

**Symptoms:**
- Job completes but payout doesn't happen
- Error in logs about Connect account

**Debugging Steps:**
1. Check cleaner's Connect account status
2. Verify `stripeConnectAccountId` exists in cleaner record
3. Check if payment was captured first (`paymentStatus === 'paid'`)
4. View logs for `payout` and `payout_to_cleaner` operations

**Common Causes:**
- Connect account not fully onboarded (`connectAccountStatus !== 'active'`)
- Payment not captured yet
- Insufficient balance in platform account
- Connect account charges not enabled

**Solutions:**
```typescript
// Check Connect account status
const account = await stripe.accounts.retrieve('acct_xxx');
console.log({
  charges_enabled: account.charges_enabled,
  payouts_enabled: account.payouts_enabled,
  details_submitted: account.details_submitted,
});
```

### Issue 3: Base URL Issues

**Symptoms:**
- Error: "Failed to fetch" or "Network error"
- Convex actions can't reach Next.js API routes

**Debugging:**
Check `NEXT_PUBLIC_BASE_URL` environment variable:
```bash
# In convex/stripeConnect.ts, check console logs
console.log('baseUrl:', baseUrl);
```

**Solutions:**
- Development: Set to `http://localhost:3000`
- Production: Set to your deployed URL (e.g., `https://renvert.no`)
- Ensure it's in both `.env.local` and Convex environment variables

### Issue 4: Insufficient Balance for Transfer

**Symptoms:**
- Error: "Insufficient funds in Stripe account"

**Cause:**
Transfer attempted before payment is settled in platform account

**Solutions:**
- Ensure payment is captured before transfer
- Check Stripe Dashboard balance
- Consider using `application_fee_amount` on Payment Intent instead of transfers (for immediate payouts)

## Testing Workflow

### Test Complete Flow

1. **Create a test job**:
   - Create job as landlord
   - Assign to cleaner
   - Use Stripe test card: `4242 4242 4242 4242`

2. **Test Authorization**:
   - Complete payment
   - Check job `paymentStatus` should be `authorized`
   - Check Stripe Dashboard for Payment Intent

3. **Test Capture**:
   - Start job as cleaner (on scheduled date)
   - Check debug dashboard for `capture_payment` log
   - Verify `paymentStatus` changes to `paid`
   - Check Stripe Dashboard - payment should be captured

4. **Test Payout**:
   - Complete job as cleaner
   - Check debug dashboard for `payout` logs
   - Verify `payoutStatus` changes to `paid`
   - Check Stripe Dashboard for Transfer

### Manual Testing via Dashboard

1. Visit `/stripe-debug`
2. Enter a job ID
3. Click "Test Capture Payment" or "Test Payout"
4. View results and logs immediately

## Monitoring in Production

### View Recent Errors

```typescript
// In Convex dashboard or via API
const errors = await convex.query(api.stripeDebug.getErrorLogs, { limit: 20 });
console.log(errors);
```

### Check Job Status

```typescript
// Get all logs for a specific job
const logs = await convex.query(api.stripeDebug.getLogsForJob, { 
  jobId: 'YOUR_JOB_ID' 
});

// Review the sequence of operations
logs.forEach(log => {
  console.log(`${log.operation}: ${log.status} - ${log.errorMessage || 'OK'}`);
});
```

## Best Practices

1. **Always check logs first**: Start at `/stripe-debug` dashboard
2. **Verify prerequisites**: 
   - Payment authorized before capture
   - Payment captured before payout
   - Connect account active before payout
3. **Test in Stripe test mode** before production
4. **Monitor error logs** regularly
5. **Use idempotency keys** to prevent duplicate operations

## Stripe Dashboard Links

- **Payments**: https://dashboard.stripe.com/test/payments
- **Connect Accounts**: https://dashboard.stripe.com/test/connect/accounts/overview
- **Transfers**: https://dashboard.stripe.com/test/connect/transfers
- **Logs**: https://dashboard.stripe.com/test/logs

## Support

If issues persist:
1. Check Stripe Dashboard logs
2. Review application logs in hosting platform
3. Check Convex logs in Convex dashboard
4. Use the debug endpoints to get detailed error messages
5. Verify environment variables are set correctly

## Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Transfers API](https://stripe.com/docs/api/transfers)
- [Separate Charges and Transfers](https://stripe.com/docs/connect/charges-transfers)

