# Payout Debugging Checklist

## What Changed

The code now calls `completeJobAndPayout` action instead of just `completeCleaningJob` mutation. This automatically triggers the payout when the job is completed.

## How to Debug Payout Issues

### Step 1: Check the Debug Dashboard

Go to `/stripe-debug` and look for:
- `payout` operation logs
- `payout_to_cleaner` operation logs
- Any errors in the "Recent Errors" section

### Step 2: Verify Prerequisites

For a payout to work, these conditions must be met:

✅ **Job Status**: `completed`
✅ **Payment Status**: `paid` (payment must be captured first!)
✅ **Cleaner has Connect Account**: `stripeConnectAccountId` exists
✅ **Connect Account Status**: `active`
✅ **Connect Account**: `charges_enabled: true`

### Step 3: Check Convex Logs

In your terminal where `npx convex dev` is running, look for:

```
=== PAYOUT TO CLEANER STARTED ===
Job ID: kjg...
Cleaner ID: jxf...
Amount: 800
Cleaner status: { connectAccountId: 'acct_...', connectAccountStatus: 'active' }
Verifying Connect account: acct_...
Connect account details: { 
  charges_enabled: true,
  payouts_enabled: true 
}
Creating transfer...
=== TRANSFER CREATED SUCCESSFULLY ===
Transfer ID: tr_...
```

### Step 4: Manually Test Payout

If a job is completed but payout didn't happen:

1. Go to `/stripe-debug`
2. Enter the job ID
3. Click "Test Payout"
4. Check the result and logs

### Step 5: Check Database

Query the job to see its current state:

```typescript
// In Convex dashboard or via query
{
  status: 'completed',          // ✅ Should be 'completed'
  paymentStatus: 'paid',        // ✅ Should be 'paid'
  payoutStatus: 'pending',      // ❌ Stuck at 'pending'?
  assignedCleanerId: 'user_...' // ✅ Should have cleaner ID
}
```

## Common Issues

### Issue 1: Payment Not Captured Yet

**Symptom**: Error: "Payment must be captured before payout"

**Solution**: 
- Payment capture happens when job starts
- Make sure the job was started (status: 'in-progress')
- Check payment was captured (paymentStatus: 'paid')
- If payment is still 'authorized', manually test capture first

### Issue 2: Connect Account Not Set Up

**Symptom**: Error: "Cleaner does not have a Stripe Connect account"

**Solution**:
1. Cleaner needs to onboard to Stripe Connect
2. Check if cleaner record has `stripeConnectAccountId`
3. If missing, cleaner needs to complete onboarding flow

### Issue 3: Connect Account Not Active

**Symptom**: Error: "Connect account is not active"

**Solution**:
1. Cleaner needs to complete Stripe onboarding
2. Check account status in Stripe Dashboard:
   - Go to Connect → Accounts
   - Find the account
   - Check if it's "Active"
3. If not active, cleaner needs to:
   - Complete identity verification
   - Add bank account details
   - Accept terms of service

### Issue 4: Insufficient Balance

**Symptom**: Stripe error about insufficient funds

**Solution**:
- Platform account needs to have funds available
- In test mode, this shouldn't be an issue
- In production, ensure payment was captured to platform first
- Check Stripe Dashboard → Balance

### Issue 5: Payout Action Not Called

**Symptom**: No logs at all for payout

**Solution**:
- Make sure you're using `completeJobAndPayout` action
- Check the component is calling the right function
- See the fix in `ActiveJobsCard.tsx` (line 54)

## Testing Workflow

### Test Complete Payout Flow:

1. **Create a test job** with test payment
2. **Start the job** (as cleaner)
   - Check payment captured (paymentStatus: 'paid')
3. **Complete the job** (as cleaner)
4. **Check logs**:
   - Convex console logs
   - `/stripe-debug` dashboard
   - Stripe Dashboard
5. **Verify payout**:
   - Job `payoutStatus` should be 'paid'
   - Transfer should appear in Stripe Dashboard
   - Cleaner should see payout badge

### Manual Test Payout:

```bash
# Via API
curl -X POST http://localhost:3000/api/stripe/debug/test-payout \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'

# Via Dashboard
1. Go to /stripe-debug
2. Enter job ID
3. Click "Test Payout"
```

## Viewing Payout Status

### In Cleaner Dashboard

Completed jobs now show a payout badge:
- 🟢 **Payout: paid (800 NOK)** - Transfer successful
- 🟡 **Payout: pending** - Not yet processed
- 🔴 **Payout: failed** - Error occurred

### In Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/connect/transfers
2. Find the transfer by Transfer ID
3. Check status and destination account
4. See when funds will arrive (instant in test mode)

### In Convex Database

Query `stripeLogs` table for payout operations:
```typescript
await convex.query(api.stripeDebug.getLogsForJob, { 
  jobId: "YOUR_JOB_ID" 
});
```

## Debug Command Examples

```bash
# View all payout errors
curl "http://localhost:3000/api/stripe/debug/logs?operation=payout&errorsOnly=true"

# View logs for specific job
curl "http://localhost:3000/api/stripe/debug/logs?jobId=kjg123..."

# Test payout manually
curl -X POST http://localhost:3000/api/stripe/debug/test-payout \
  -H "Content-Type: application/json" \
  -d '{"jobId": "kjg123..."}'
```

## What to Check in Order

1. ✅ Job is completed (`status: 'completed'`)
2. ✅ Payment is captured (`paymentStatus: 'paid'`)
3. ✅ Cleaner assigned (`assignedCleanerId` exists)
4. ✅ Connect account exists (`stripeConnectAccountId` exists)
5. ✅ Connect account active (`connectAccountStatus: 'active'`)
6. ✅ Check `/stripe-debug` for errors
7. ✅ Check Convex console logs
8. ✅ Check Stripe Dashboard

## Success Indicators

When payout works correctly, you'll see:

1. **In Logs**:
   ```
   === TRANSFER CREATED SUCCESSFULLY ===
   Transfer ID: tr_abc123
   Amount: 80000
   Destination: acct_xyz789
   ```

2. **In Database**:
   ```typescript
   {
     payoutStatus: 'paid',
     stripeTransferId: 'tr_abc123',
     payoutDate: 1234567890
   }
   ```

3. **In UI**:
   - Badge shows: "💰 Payout: paid (800 NOK)"

4. **In Stripe Dashboard**:
   - Transfer appears in Connect → Transfers
   - Status: "Paid"

## Need More Help?

If payouts still aren't working:

1. Share the logs from `/stripe-debug` for the job
2. Share the Convex console output
3. Check if there are any Stripe errors in Stripe Dashboard → Logs
4. Verify all prerequisites are met (checklist above)

