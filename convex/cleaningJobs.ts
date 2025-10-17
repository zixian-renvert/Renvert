import { v } from 'convex/values';
import { api } from './_generated/api';
import { action, internalQuery, mutation, query } from './_generated/server';

// Create a new cleaning job with Stripe Connect support
export const createCleaningJob = mutation({
  args: {
    landlordId: v.string(),
    propertyId: v.id('properties'),
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    scheduledDate: v.string(),
    scheduledTime: v.union(v.string(), v.null()),
    specialInstructions: v.union(v.string(), v.null()),
    totalPrice: v.number(),
    pricePerDate: v.number(),
    platformFee: v.number(),
    cleanerPayout: v.number(),
    stripePaymentIntentId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const {
      landlordId,
      propertyId,
      serviceType,
      scheduledDate,
      scheduledTime,
      specialInstructions,
      totalPrice,
      pricePerDate,
      platformFee,
      cleanerPayout,
      stripePaymentIntentId,
    } = args;

    const cleaningJobId = await ctx.db.insert('cleaningJobs', {
      landlordId,
      propertyId,
      serviceType,
      scheduledDate,
      scheduledTime,
      specialInstructions,
      price: totalPrice || 0, // Base price
      totalPrice,
      pricePerDate,
      platformFee,
      cleanerPayout,
      stripePaymentIntentId,
      status: 'pending',
      paymentStatus: 'pending',
      payoutStatus: 'pending',
      assignedCleanerId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return cleaningJobId;
  },
});

// Get cleaning jobs for a landlord
export const getLandlordCleaningJobs = query({
  args: { landlordId: v.string() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query('cleaningJobs')
      .withIndex('by_landlordId', (q) => q.eq('landlordId', args.landlordId))
      .order('desc')
      .collect();

    // Get property details for each job
    const jobsWithProperties = await Promise.all(
      jobs.map(async (job) => {
        const property = await ctx.db.get(job.propertyId);
        return {
          ...job,
          property,
        };
      })
    );

    return jobsWithProperties;
  },
});

// Get available cleaning jobs for cleaners (including jobs they've requested)
export const getAvailableCleaningJobs = query({
  args: {
    serviceType: v.optional(
      v.union(v.literal('bnb-cleaning'), v.literal('deep-cleaning'), v.literal('move-out-cleaning'))
    ),
    city: v.optional(v.string()),
    cleanerId: v.optional(v.string()), // To check request status
  },
  handler: async (ctx, args) => {
    // Get jobs that are pending or requested (available for requests)
    const pendingJobs = await ctx.db
      .query('cleaningJobs')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .order('desc')
      .collect();

    const requestedJobs = await ctx.db
      .query('cleaningJobs')
      .withIndex('by_status', (q) => q.eq('status', 'requested'))
      .order('desc')
      .collect();

    const allJobs = [...pendingJobs, ...requestedJobs];

    // Filter by service type if specified
    const filteredJobs = args.serviceType
      ? allJobs.filter((job) => job.serviceType === args.serviceType)
      : allJobs;

    // Get property, landlord details, and request status for each job
    const jobsWithDetails = await Promise.all(
      filteredJobs.map(async (job) => {
        const property = await ctx.db.get(job.propertyId);
        const landlord = await ctx.db
          .query('landlords')
          .withIndex('by_userId', (q) => q.eq('userId', job.landlordId))
          .first();

        // Check if this cleaner has requested this job
        let cleanerRequest = null;
        if (args.cleanerId) {
          cleanerRequest = await ctx.db
            .query('cleanerRequests')
            .withIndex('by_jobId', (q) => q.eq('jobId', job._id))
            .filter((q) => q.eq(q.field('cleanerId'), args.cleanerId))
            .filter((q) => q.neq(q.field('status'), 'withdrawn'))
            .first();
        }

        return {
          ...job,
          property,
          landlord,
          cleanerRequest, // null if not requested, or the request object
        };
      })
    );

    // Filter by city if specified
    if (args.city) {
      return jobsWithDetails.filter(
        (job) => job.property?.city?.toLowerCase() === args.city?.toLowerCase()
      );
    }

    return jobsWithDetails;
  },
});

// Update cleaning job status
export const updateCleaningJobStatus = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('in-progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    assignedCleanerId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.assignedCleanerId !== undefined) {
      updateData.assignedCleanerId = args.assignedCleanerId;
    }

    await ctx.db.patch(args.jobId, updateData);
    return { success: true };
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    paymentStatus: v.union(v.literal('pending'), v.literal('paid'), v.literal('failed')),
    stripePaymentIntentId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { jobId, paymentStatus, stripePaymentIntentId } = args;

    await ctx.db.patch(jobId, {
      paymentStatus,
      stripePaymentIntentId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Internal mutation used by actions to mark payout paid
export const markPayoutPaid = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    transferId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      payoutStatus: 'paid',
      payoutDate: Date.now(),
      stripeTransferId: args.transferId,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Internal mutation used by actions to mark payout as pending
export const markPayoutPending = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      payoutStatus: 'pending',
      payoutPendingReason: args.reason,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Get jobs with pending payouts (for cron job processing)
export const getJobsWithPendingPayouts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query('cleaningJobs')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'completed'),
          q.eq(q.field('paymentStatus'), 'paid'),
          q.eq(q.field('payoutStatus'), 'pending')
        )
      )
      .collect();
    
    return jobs;
  },
});

// Get cleaning job by ID
export const getCleaningJobById = query({
  args: { jobId: v.id('cleaningJobs') },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const property = await ctx.db.get(job.propertyId);
    const landlord = await ctx.db
      .query('landlords')
      .withIndex('by_userId', (q) => q.eq('userId', job.landlordId))
      .first();

    const assignedCleaner = job.assignedCleanerId
      ? await ctx.db
          .query('cleaners')
          .withIndex('by_userId', (q) => q.eq('userId', job.assignedCleanerId!))
          .first()
      : null;

    return {
      ...job,
      property,
      landlord,
      assignedCleaner,
    };
  },
});

// Get cleaning jobs assigned to a specific cleaner
export const getCleanerAssignedJobs = query({
  args: { cleanerId: v.string() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query('cleaningJobs')
      .withIndex('by_assignedCleanerId', (q) => q.eq('assignedCleanerId', args.cleanerId))
      .order('desc')
      .collect();

    // Get property and landlord details for each job
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const property = await ctx.db.get(job.propertyId);
        const landlord = await ctx.db
          .query('landlords')
          .withIndex('by_userId', (q) => q.eq('userId', job.landlordId))
          .first();

        return {
          ...job,
          property,
          landlord,
        };
      })
    );

    return jobsWithDetails;
  },
});

// Old function removed - replaced with new completeCleaningJob below

// Get cleaning jobs by cleaner
export const getCleaningJobsByCleaner = query({
  args: {
    cleanerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('cleaningJobs')
      .withIndex('by_assignedCleanerId', (q) => q.eq('assignedCleanerId', args.cleanerId))
      .collect();
  },
});

// Start a cleaning job (mark as in-progress)
export const startCleaningJob = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(),
  },
  handler: async (ctx, args) => {
    const { jobId, cleanerId } = args;

    // Get the job and verify it's assigned to this cleaner
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error('Cleaning job not found');
    }

    if (job.assignedCleanerId !== cleanerId) {
      throw new Error('Job is not assigned to this cleaner');
    }

    if (job.status !== 'confirmed') {
      throw new Error('Job must be confirmed before starting');
    }

    // Check if job is scheduled for today
    const today = new Date().toISOString().split('T')[0];
    if (job.scheduledDate !== today) {
      throw new Error('Job can only be started on the scheduled date');
    }

    // Update job to in-progress
    await ctx.db.patch(jobId, {
      status: 'in-progress',
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, jobId };
  },
});

// Action to start job and capture payment
export const startJobAndCapturePayment = action({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    jobStarted?: boolean;
    paymentCaptured?: boolean;
    captureError?: string;
    error?: string;
  }> => {
    const { jobId, cleanerId } = args;

    try {
      // First start the job
      const startResult = await ctx.runMutation(api.cleaningJobs.startCleaningJob, {
        jobId,
        cleanerId,
      });

      if (!startResult.success) {
        throw new Error('Failed to start job');
      }

      // Then capture the payment
      const captureResult = await ctx.runAction(api.stripeConnect.capturePaymentForJob, {
        jobId,
      });

      if (captureResult.error) {
        console.error('Payment capture failed but job started:', captureResult.error);
        return {
          success: true,
          jobStarted: true,
          captureError: captureResult.error,
        };
      }

      return {
        success: true,
        jobStarted: true,
        paymentCaptured: true,
      };
    } catch (error) {
      console.error('Error in startJobAndCapturePayment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

// Complete a cleaning job (mark as completed)
export const completeCleaningJob = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, cleanerId, rating, feedback } = args;

    // Get the job and verify it's assigned to this cleaner
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error('Cleaning job not found');
    }

    if (job.assignedCleanerId !== cleanerId) {
      throw new Error('Job is not assigned to this cleaner');
    }

    if (job.status !== 'in-progress') {
      throw new Error('Job must be in progress to complete');
    }

    // Update job to completed
    await ctx.db.patch(jobId, {
      status: 'completed',
      completedAt: Date.now(),
      cleanerRating: rating,
      cleanerFeedback: feedback,
      updatedAt: Date.now(),
    });

    return { success: true, jobId };
  },
});

// Update payment status to authorized when payment is confirmed but not captured
export const markPaymentAuthorized = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const { jobId, stripePaymentIntentId } = args;

    await ctx.db.patch(jobId, {
      paymentStatus: 'authorized',
      stripePaymentIntentId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Action to complete job and trigger automatic payout
export const completeJobAndPayout = action({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    jobCompleted?: boolean;
    payoutId?: string;
    payoutError?: string;
    error?: string;
  }> => {
    const { jobId, cleanerId, rating, feedback } = args;

    try {
      // First complete the job
      const completeResult = await ctx.runMutation(api.cleaningJobs.completeCleaningJob, {
        jobId,
        cleanerId,
        rating,
        feedback,
      });

      if (!completeResult.success) {
        throw new Error('Failed to complete job');
      }

      // Then trigger the payout
      const payoutResult = await ctx.runAction(api.stripeConnect.payoutForCompletedJob, {
        jobId,
      });

      if (payoutResult.error) {
        // Check if this is an expected insufficient funds error
        const isInsufficientFunds = payoutResult.error.includes('INSUFFICIENT_FUNDS');
        
        if (isInsufficientFunds) {
          console.log('Payout pending - funds being processed by Stripe. Will be retried automatically.');
        } else {
          console.error('Payout failed but job completed:', payoutResult.error);
        }
        
        // Job is still completed, just payout pending/failed
        return {
          success: true,
          jobCompleted: true,
          payoutError: payoutResult.error,
        };
      }

      return {
        success: true,
        jobCompleted: true,
        payoutId: payoutResult.payoutId,
      };
    } catch (error) {
      console.error('Error in completeJobAndPayout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

// Cancel a cleaning job (only if no cleaner has been assigned)
export const cancelCleaningJob = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    landlordId: v.string(),
  },
  handler: async (ctx, args) => {
    const { jobId, landlordId } = args;

    // Get the job and verify ownership
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error('Cleaning job not found');
    }

    if (job.landlordId !== landlordId) {
      throw new Error('You can only cancel your own jobs');
    }

    // Only allow cancellation if no cleaner has been assigned
    if (job.assignedCleanerId) {
      throw new Error('Cannot cancel job that has been assigned to a cleaner');
    }

    // Only allow cancellation if job is pending or requested
    if (job.status !== 'pending' && job.status !== 'requested') {
      throw new Error('Can only cancel pending or requested jobs');
    }

    // Update job status to cancelled
    await ctx.db.patch(jobId, {
      status: 'cancelled',
      updatedAt: Date.now(),
    });

    return { success: true, jobId };
  },
});

// Update a cleaning job (only if no cleaner has been assigned)
export const updateCleaningJob = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    landlordId: v.string(),
    serviceType: v.optional(
      v.union(v.literal('bnb-cleaning'), v.literal('deep-cleaning'), v.literal('move-out-cleaning'))
    ),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.union(v.string(), v.null())),
    specialInstructions: v.optional(v.union(v.string(), v.null())),
    totalPrice: v.optional(v.number()),
    pricePerDate: v.optional(v.number()),
    platformFee: v.optional(v.number()),
    cleanerPayout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      jobId,
      landlordId,
      serviceType,
      scheduledDate,
      scheduledTime,
      specialInstructions,
      totalPrice,
      pricePerDate,
      platformFee,
      cleanerPayout,
    } = args;

    // Get the job and verify ownership
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error('Cleaning job not found');
    }

    if (job.landlordId !== landlordId) {
      throw new Error('You can only edit your own jobs');
    }

    // Only allow editing if no cleaner has been assigned
    if (job.assignedCleanerId) {
      throw new Error('Cannot edit job that has been assigned to a cleaner');
    }

    // Only allow editing if job is pending or requested
    if (job.status !== 'pending' && job.status !== 'requested') {
      throw new Error('Can only edit pending or requested jobs');
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions;
    if (totalPrice !== undefined) {
      updateData.totalPrice = totalPrice;
      updateData.price = totalPrice; // Also update base price
    }
    if (pricePerDate !== undefined) updateData.pricePerDate = pricePerDate;
    if (platformFee !== undefined) updateData.platformFee = platformFee;
    if (cleanerPayout !== undefined) updateData.cleanerPayout = cleanerPayout;

    // Update the job
    await ctx.db.patch(jobId, updateData);

    return { success: true, jobId };
  },
});
