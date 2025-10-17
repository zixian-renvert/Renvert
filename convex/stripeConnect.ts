import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { action, internalAction, mutation, query } from './_generated/server';

// Import Stripe SDK directly - no need to call Next.js API routes
// Convex actions can use Node.js packages
const Stripe = require('stripe');

// Helper function to get Stripe instance (lazy initialization)
// This prevents initialization during deployment analysis
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  
  return new Stripe(apiKey, {
    apiVersion: '2023-10-16' as any,
    timeout: 30000, // 30 second timeout for Convex production
    maxNetworkRetries: 3, // More retries for network issues
  });
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL;
}

// Create a Stripe Connect account for a cleaner
export const createConnectAccount = action({
  args: {
    cleanerId: v.id('cleaners'),
    email: v.string(),
    country: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal('express'), v.literal('standard'))),
  },
  handler: async (ctx, args): Promise<{ accountId: string; accountStatus: string }> => {
    const { cleanerId, email, country = 'NO', accountType = 'express' } = args;
    const baseUrl = getBaseUrl();

    // Call the Stripe API to create Connect account
    const response = await fetch(`${baseUrl}/api/stripe/connect/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        country,
        type: accountType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Connect account');
    }

    const createJson: any = await response.json();
    const accountId: string = createJson.accountId;
    const accountStatus: string = createJson.accountStatus;

    // Update the cleaner with Connect account details via mutation
    const normalizedStatus =
      accountStatus === 'active' || accountStatus === 'restricted' || accountStatus === 'disabled'
        ? accountStatus
        : 'pending';
    await ctx.runMutation(api.stripeConnect.setConnectAccount, {
      cleanerId,
      accountId,
      accountStatus: normalizedStatus as 'pending' | 'active' | 'restricted' | 'disabled',
    });

    return { accountId, accountStatus };
  },
});

// Get onboarding link for a cleaner
export const getOnboardingLink = action({
  args: {
    cleanerId: v.id('cleaners'),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ accountLink: string }> => {
    const { cleanerId, returnUrl } = args;
    const baseUrl = getBaseUrl();

    const status: any = await ctx.runQuery(api.stripeConnect.getConnectAccountStatus, {
      cleanerId,
    });
    if (!status || !status.connectAccountId) {
      throw new Error('Cleaner or Connect account not found');
    }

    // Call the Stripe API to create onboarding link
    const response: Response = await fetch(`${baseUrl}/api/stripe/connect/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: status.connectAccountId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create onboarding link');
    }

    const onboardJson: any = await response.json();
    const accountLink: string = onboardJson.accountLink;
    return { accountLink };
  },
});

// Pay out to a cleaner when job is completed
export const payoutToCleaner = action({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.id('cleaners'),
    amount: v.number(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{ transferId: string; amount: number; currency: string; insufficientFunds?: boolean }> => {
    const { jobId, cleanerId, amount, description, metadata } = args;

    try {
      const job: any = await ctx.runQuery(api.cleaningJobs.getCleaningJobById, { jobId });
      if (!job) {
        throw new Error('Cleaning job not found');
      }

      const cleanerStatus: any = await ctx.runQuery(api.stripeConnect.getConnectAccountStatus, {
        cleanerId,
      });
      
      if (!cleanerStatus || !cleanerStatus.connectAccountId) {
        throw new Error('Cleaner or Connect account not found');
      }
      
      // Verify Connect account is active before payout
      if (cleanerStatus.connectAccountStatus !== 'active') {
        throw new Error(`Cleaner's Connect account is not active (status: ${cleanerStatus.connectAccountStatus}). Please complete onboarding.`);
      }

      // Verify the Connect account exists and is enabled
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(cleanerStatus.connectAccountId);

      if (!account.charges_enabled) {
        throw new Error('Connect account is not enabled for charges. Please complete onboarding.');
      }

      // Create a transfer to the cleaner's Connect account using Stripe SDK directly
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'nok',
        destination: cleanerStatus.connectAccountId,
        description: description || `Payment for cleaning job ${jobId}`,
        metadata: {
          ...metadata,
          jobId: jobId,
          cleanerId: cleanerId,
          serviceType: job.serviceType,
        },
      });

      const transferId: string = transfer.id;
      const transferAmount: number = transfer.amount / 100; // Convert back from cents
      const currency: string = transfer.currency;

      // Update the cleaning job with payout details via mutation
      await ctx.runMutation(api.cleaningJobs.markPayoutPaid, {
        jobId,
        transferId,
      });

      return { transferId, amount: transferAmount, currency };
    } catch (error) {
      // Check if error is due to insufficient funds (expected during Stripe settlement period)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isInsufficientFunds = errorMessage.toLowerCase().includes('insufficient') || 
                                  errorMessage.toLowerCase().includes('available funds');
      
      if (isInsufficientFunds) {
        // This is expected - Stripe takes 2-7 days to make funds available
        console.log('⏳ Payout pending - waiting for Stripe to settle funds (2-7 days). Will retry automatically.');
        
        // Mark payout as pending - it will be retried when funds are available
        await ctx.runMutation(api.cleaningJobs.markPayoutPending, {
          jobId,
          reason: 'Funds are being processed by Stripe. Payout will be completed automatically within 2-7 business days.',
        });
        
        // Don't throw - return success with pending flag
        return { 
          transferId: '', 
          amount: 0, 
          currency: 'nok',
          insufficientFunds: true 
        };
      }
      
      // For actual errors (not insufficient funds), log as error and throw
      console.error('❌ Unexpected payout error:', errorMessage);
      throw error;
    }
  },
});

// Get Connect account status for a cleaner
export const getConnectAccountStatus = query({
  args: {
    cleanerId: v.id('cleaners'),
  },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db.get(args.cleanerId);
    if (!cleaner) {
      return null;
    }

    return {
      connectAccountId: cleaner.stripeConnectAccountId,
      connectAccountStatus: cleaner.connectAccountStatus,
      payoutSchedule: cleaner.payoutSchedule,
      bankAccountDetails: cleaner.bankAccountDetails,
    };
  },
});

// Update Connect account status (called from webhook)
export const updateConnectAccountStatus = mutation({
  args: {
    cleanerId: v.id('cleaners'),
    status: v.union(
      v.literal('pending'),
      v.literal('active'),
      v.literal('restricted'),
      v.literal('disabled')
    ),
    bankAccountDetails: v.optional(
      v.object({
        last4: v.string(),
        bankName: v.string(),
        accountType: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { cleanerId, status, bankAccountDetails } = args;

    const updateData: any = {
      connectAccountStatus: status,
      updatedAt: Date.now(),
    };

    if (bankAccountDetails) {
      updateData.bankAccountDetails = bankAccountDetails;
    }

    await ctx.db.patch(cleanerId, updateData);

    return { success: true };
  },
});

// Update Connect status by Stripe account ID (used by webhook)
export const updateConnectAccountStatusByAccountId = mutation({
  args: {
    accountId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('active'),
      v.literal('restricted'),
      v.literal('disabled')
    ),
    bankAccountDetails: v.optional(
      v.object({
        last4: v.string(),
        bankName: v.string(),
        accountType: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .filter((q) => q.eq(q.field('stripeConnectAccountId'), args.accountId))
      .first();

    if (!cleaner) {
      return { success: false, error: 'Cleaner not found' };
    }

    const update: any = {
      connectAccountStatus: args.status,
      updatedAt: Date.now(),
    };
    if (args.bankAccountDetails) update.bankAccountDetails = args.bankAccountDetails;

    await ctx.db.patch(cleaner._id, update);

    return { success: true };
  },
});

// Internal mutation used by actions to set connect account fields
export const setConnectAccount = mutation({
  args: {
    cleanerId: v.id('cleaners'),
    accountId: v.string(),
    accountStatus: v.union(
      v.literal('pending'),
      v.literal('active'),
      v.literal('restricted'),
      v.literal('disabled')
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cleanerId, {
      stripeConnectAccountId: args.accountId,
      connectAccountStatus: args.accountStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Capture payment when job starts (cleaner shows up)
export const capturePaymentForJob = action({
  args: {
    jobId: v.id('cleaningJobs'),
  },
  handler: async (ctx, args): Promise<{ captured: boolean; error?: string }> => {
    const { jobId } = args;

    try {
      // Get the job details
      const job: any = await ctx.runQuery(api.cleaningJobs.getCleaningJobById, { jobId });
      if (!job) {
        throw new Error('Cleaning job not found');
      }

      if (job.status !== 'in-progress') {
        throw new Error(`Job must be in progress to capture payment. Current status: ${job.status}`);
      }

      if (!job.stripePaymentIntentId) {
        throw new Error('No payment intent found for this job');
      }

      // First, retrieve the payment intent to check its status
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(job.stripePaymentIntentId);

      // Check if already captured
      if (paymentIntent.status === 'succeeded') {
        await ctx.runMutation(api.cleaningJobs.updatePaymentStatus, {
          jobId,
          paymentStatus: 'paid',
          stripePaymentIntentId: job.stripePaymentIntentId,
        });
        
        return { captured: true };
      }

      // Check if in capturable state
      if (paymentIntent.status !== 'requires_capture') {
        throw new Error(`Payment intent is in ${paymentIntent.status} state, cannot capture`);
      }

      // Capture the payment using Stripe SDK directly
      const idempotencyKey = `job_${jobId}_capture_${new Date().toISOString().slice(0,10)}`;
      
      const capturedPayment = await stripe.paymentIntents.capture(
        job.stripePaymentIntentId,
        {},
        { idempotencyKey }
      );

      // Update payment status to paid
      await ctx.runMutation(api.cleaningJobs.updatePaymentStatus, {
        jobId,
        paymentStatus: 'paid',
        stripePaymentIntentId: job.stripePaymentIntentId,
      });

      return { captured: true };
    } catch (error) {
      // Enhanced error logging for debugging production issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorDetails: any = {
        message: errorMessage,
        jobId,
      };
      
      // Log Stripe-specific error details
      if (error && typeof error === 'object') {
        if ('type' in error) errorDetails.type = (error as any).type;
        if ('code' in error) errorDetails.code = (error as any).code;
        if ('statusCode' in error) errorDetails.statusCode = (error as any).statusCode;
        if ('raw' in error && typeof (error as any).raw === 'object') {
          errorDetails.rawError = (error as any).raw.message;
        }
      }
      
      console.error('Payment capture failed:', JSON.stringify(errorDetails));
      
      return {
        captured: false,
        error: errorMessage,
      };
    }
  },
});

// Internal action to process all pending payouts (called by cron)
export const processPendingPayouts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ processed: number; successful: number; failed: number }> => {
    let processed = 0;
    let successful = 0;
    let failed = 0;

    try {
      // Get all jobs with pending payouts
      const pendingJobs: any[] = await ctx.runQuery(internal.cleaningJobs.getJobsWithPendingPayouts, {});
      
      console.log(`Found ${pendingJobs.length} jobs with pending payouts`);
      
      for (const job of pendingJobs) {
        processed++;
        
        try {
          // Attempt to process the payout
          const result = await ctx.runAction(api.stripeConnect.payoutForCompletedJob, {
            jobId: job._id,
          });
          
          if (result.payoutId) {
            successful++;
            console.log(`✅ Successfully processed payout for job ${job._id}`);
          } else if (result.error) {
            // If still insufficient funds, it will remain pending (not an error)
            if (result.error.includes('INSUFFICIENT_FUNDS')) {
              console.log(`⏳ Payout still pending for job ${job._id} - funds not yet available`);
            } else {
              // Actual error
              failed++;
              console.error(`❌ Failed to process payout for job ${job._id}:`, result.error);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing payout for job ${job._id}:`, error);
          failed++;
        }
      }
      
      return { processed, successful, failed };
    } catch (error) {
      console.error('Error in processPendingPayouts:', error);
      return { processed, successful, failed };
    }
  },
});

// Payout to cleaner when job is completed
export const payoutForCompletedJob = action({
  args: {
    jobId: v.id('cleaningJobs'),
  },
  handler: async (ctx, args): Promise<{ payoutId?: string; error?: string }> => {
    const { jobId } = args;

    try {
      // Get the job details
      const job: any = await ctx.runQuery(api.cleaningJobs.getCleaningJobById, { jobId });
      if (!job) {
        throw new Error('Cleaning job not found');
      }

      if (job.status !== 'completed') {
        throw new Error('Job must be completed before payout');
      }

      if (job.paymentStatus !== 'paid') {
        throw new Error('Payment must be captured before payout');
      }

      if (!job.assignedCleanerId) {
        throw new Error('No cleaner assigned to this job');
      }

      // Get cleaner for payout
      const cleaner = await ctx.runQuery(api.cleaners.getCleanerByUserId, {
        userId: job.assignedCleanerId,
      });
      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      // Check if cleaner has a Connect account
      if (!cleaner.stripeConnectAccountId) {
        throw new Error('Cleaner does not have a Stripe Connect account');
      }

      // Trigger payout to cleaner
      const payoutResult = await ctx.runAction(api.stripeConnect.payoutToCleaner, {
        jobId,
        cleanerId: cleaner._id,
        amount: job.cleanerPayout || job.totalPrice,
        description: `Payment for ${job.serviceType} at ${job.property?.address}`,
        metadata: {
          jobId: jobId,
          scheduledDate: job.scheduledDate,
          propertyAddress: job.property?.address,
        },
      });

      return { payoutId: payoutResult.transferId };
    } catch (error) {
      console.error('Error in payoutForCompletedJob:', error);
      
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});
