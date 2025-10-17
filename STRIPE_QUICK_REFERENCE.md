# Stripe Debugging - Quick Reference Card

## 🚀 Quick Access

| Resource | URL/Path |
|----------|----------|
| Debug Dashboard | `/stripe-debug` |
| Test Capture API | `POST /api/stripe/debug/test-capture` |
| Test Payout API | `POST /api/stripe/debug/test-payout` |
| Logs API | `GET /api/stripe/debug/logs` |
| Stripe Dashboard | https://dashboard.stripe.com |

## 📊 Payment States

```
pending → authorized → paid
              ↓
          captured
              ↓
          transferred (to cleaner)
```

## ✅ Required Conditions

### For Capture to Work:
- ✅ Job status: `in-progress`
- ✅ Payment status: `authorized` or `pending`
- ✅ Has `stripePaymentIntentId`
- ✅ Payment intent state: `requires_capture` (check Stripe)

### For Payout to Work:
- ✅ Job status: `completed`
- ✅ Payment status: `paid` (captured first!)
- ✅ Has `assignedCleanerId`
- ✅ Cleaner has `stripeConnectAccountId`
- ✅ Connect account status: `active`
- ✅ Connect account: `charges_enabled: true`

## 🔍 Debugging Commands

```bash
# View recent errors
curl "http://localhost:3000/api/stripe/debug/logs?errorsOnly=true"

# View logs for a job
curl "http://localhost:3000/api/stripe/debug/logs?jobId=YOUR_JOB_ID"

# Test capture
curl -X POST http://localhost:3000/api/stripe/debug/test-capture \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'

# Test payout
curl -X POST http://localhost:3000/api/stripe/debug/test-payout \
  -H "Content-Type: application/json" \
  -d '{"jobId": "YOUR_JOB_ID"}'
```

## 🎯 Common Issues & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "Payment intent is in [status] state" | Check Stripe Dashboard - may already be captured |
| "Job must be in progress" | Change job status to `in-progress` |
| "No payment intent found" | Check job has `stripePaymentIntentId` |
| "Connect account is not active" | Cleaner needs to complete onboarding |
| "Payment must be captured before payout" | Run capture first |
| "Failed to fetch" / Network error | Check `NEXT_PUBLIC_BASE_URL` env var |

## 📝 Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

## 🗄️ Database Queries (Convex)

```typescript
// Get logs for a job
await convex.query(api.stripeDebug.getLogsForJob, { jobId: "..." });

// Get error logs
await convex.query(api.stripeDebug.getErrorLogs, { limit: 20 });

// Get all logs
await convex.query(api.stripeDebug.getAllLogs, { limit: 50 });
```

## 🔧 Manual Testing Steps

1. **Create Test Job**
   - Create job as landlord
   - Assign to cleaner
   - Pay with test card: `4242 4242 4242 4242`

2. **Test Capture**
   - Go to `/stripe-debug`
   - Enter job ID
   - Click "Test Capture Payment"
   - Check result

3. **Test Payout**
   - Ensure payment captured
   - Go to `/stripe-debug`
   - Enter same job ID
   - Click "Test Payout"
   - Check result

## 📈 Monitoring

```typescript
// Check operation success rate
const logs = await convex.query(api.stripeDebug.getRecentLogs, {
  operation: "capture_payment",
  limit: 100
});
const successRate = logs.filter(l => l.status === 'success').length / logs.length;
```

## 🎨 Status Colors (in Dashboard)

- 🟢 Green = Success
- 🔴 Red = Error
- 🟡 Yellow = Pending

## 📞 Support Checklist

Before asking for help:
- [ ] Checked `/stripe-debug` dashboard
- [ ] Reviewed error logs
- [ ] Checked Stripe Dashboard
- [ ] Verified all prerequisites
- [ ] Tested with the test endpoints
- [ ] Reviewed `STRIPE_DEBUG_GUIDE.md`

## 🔗 Useful Links

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Payment Intents](https://stripe.com/docs/api/payment_intents)
- [Transfers](https://stripe.com/docs/api/transfers)
- [Testing](https://stripe.com/docs/testing)

