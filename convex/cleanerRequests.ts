import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Submit a request to work on a job
export const requestJob = mutation({
  args: {
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, cleanerId, message } = args;

    // Check if job exists and is available for requests
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'pending') {
      throw new Error('Job is no longer available for requests');
    }

    // Check if cleaner already requested this job
    const existingRequest = await ctx.db
      .query('cleanerRequests')
      .withIndex('by_jobId', (q) => q.eq('jobId', jobId))
      .filter((q) => q.eq(q.field('cleanerId'), cleanerId))
      .filter((q) => q.neq(q.field('status'), 'withdrawn'))
      .first();

    if (existingRequest) {
      throw new Error('You have already requested this job');
    }

    // Create the request
    const requestId = await ctx.db.insert('cleanerRequests', {
      jobId,
      cleanerId,
      message,
      requestedAt: Date.now(),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update job status to 'requested' if this is the first request
    const requestCount = await ctx.db
      .query('cleanerRequests')
      .withIndex('by_jobId', (q) => q.eq('jobId', jobId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    if (requestCount.length === 1) {
      await ctx.db.patch(jobId, {
        status: 'requested',
        updatedAt: Date.now(),
      });
    }

    return requestId;
  },
});

// Get requests for a specific job (for landlords)
export const getJobRequests = query({
  args: { jobId: v.id('cleaningJobs') },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('cleanerRequests')
      .withIndex('by_jobId', (q) => q.eq('jobId', args.jobId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .order('desc')
      .collect();

    // Get cleaner details for each request
    const requestsWithCleaners = await Promise.all(
      requests.map(async (request) => {
        const cleaner = await ctx.db
          .query('cleaners')
          .withIndex('by_userId', (q) => q.eq('userId', request.cleanerId))
          .first();

        const user = await ctx.db
          .query('users')
          .withIndex('by_userId', (q) => q.eq('userId', request.cleanerId))
          .first();

        // Get company details if cleaner is associated with a company
        let company: any = null;
        if (cleaner?.companyId) {
          console.log(
            'Looking up company for cleaner:',
            cleaner.userId,
            'companyId:',
            cleaner.companyId
          );
          company = await ctx.db.get(cleaner.companyId as any);
          console.log('Found company:', company ? company.name : 'NOT FOUND');
        } else {
          console.log('No companyId for cleaner:', cleaner?.userId);
        }

        // Get cleaner's completed jobs count and average rating
        const completedJobs = await ctx.db
          .query('cleaningJobs')
          .withIndex('by_assignedCleanerId', (q) => q.eq('assignedCleanerId', request.cleanerId))
          .filter((q) => q.eq(q.field('status'), 'completed'))
          .collect();

        const totalRating = completedJobs.reduce((sum, job) => sum + (job.cleanerRating || 0), 0);
        const averageRating = completedJobs.length > 0 ? totalRating / completedJobs.length : 0;

        return {
          ...request,
          cleaner,
          user,
          company,
          stats: {
            completedJobs: completedJobs.length,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          },
        };
      })
    );

    return requestsWithCleaners;
  },
});

// Accept a cleaner's request (landlord selects cleaner)
export const acceptCleanerRequest = mutation({
  args: {
    requestId: v.id('cleanerRequests'),
    jobId: v.id('cleaningJobs'),
  },
  handler: async (ctx, args) => {
    const { requestId, jobId } = args;

    // Get the request
    const request = await ctx.db.get(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Request not found or no longer pending');
    }

    // Update the accepted request
    await ctx.db.patch(requestId, {
      status: 'accepted',
      updatedAt: Date.now(),
    });

    // Decline all other requests for this job
    const otherRequests = await ctx.db
      .query('cleanerRequests')
      .withIndex('by_jobId', (q) => q.eq('jobId', jobId))
      .filter((q) => q.neq(q.field('_id'), requestId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    await Promise.all(
      otherRequests.map((req) =>
        ctx.db.patch(req._id, {
          status: 'declined',
          updatedAt: Date.now(),
        })
      )
    );

    // Update job to confirmed with assigned cleaner
    await ctx.db.patch(jobId, {
      status: 'confirmed',
      assignedCleanerId: request.cleanerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get cleaner's requests (for cleaners to see their request history)
export const getCleanerRequests = query({
  args: { cleanerId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('cleanerRequests')
      .withIndex('by_cleanerId', (q) => q.eq('cleanerId', args.cleanerId))
      .order('desc')
      .collect();

    // Get job details for each request
    const requestsWithJobs = await Promise.all(
      requests.map(async (request) => {
        const job = await ctx.db.get(request.jobId);
        const property = job ? await ctx.db.get(job.propertyId) : null;

        return {
          ...request,
          job,
          property,
        };
      })
    );

    return requestsWithJobs;
  },
});

// Withdraw a request (cleaner cancels their request)
export const withdrawRequest = mutation({
  args: { requestId: v.id('cleanerRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Request not found or cannot be withdrawn');
    }

    await ctx.db.patch(args.requestId, {
      status: 'withdrawn',
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Debug query to check cleaner-company relationships
export const debugCleanerCompanies = query({
  args: {},
  handler: async (ctx) => {
    const cleaners = await ctx.db.query('cleaners').collect();
    const companies = await ctx.db.query('companies').collect();

    const cleanersWithCompanies = await Promise.all(
      cleaners.map(async (cleaner) => {
        let company: any = null;
        if (cleaner.companyId) {
          company = await ctx.db.get(cleaner.companyId as any);
        }
        return {
          cleanerId: cleaner._id,
          userId: cleaner.userId,
          companyId: cleaner.companyId,
          companyFound: !!company,
          companyName: company?.name || null,
        };
      })
    );

    return {
      totalCleaners: cleaners.length,
      totalCompanies: companies.length,
      cleanersWithCompanies: cleanersWithCompanies,
    };
  },
});
