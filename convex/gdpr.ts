import { v } from 'convex/values';
import { api } from './_generated/api';
import { action, mutation, query } from './_generated/server';

// Queries to fetch user-related data for export
export const getUserByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
  },
});

export const getPropertiesByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('properties')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const getLandlordByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('landlords')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
  },
});

export const getCustomersByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const getPaymentMethodsByStripeCustomerIds = query({
  args: { customerStripeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('paymentMethods').collect();
    const ids = new Set(args.customerStripeIds);
    return all.filter((pm) => ids.has(pm.customerId));
  },
});

// Action: Export all user data as a structured object
export const exportUserData: any = action({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.gdpr.getUserByUserId, { userId: args.userId });
    const properties = await ctx.runQuery(api.gdpr.getPropertiesByUserId, { userId: args.userId });
    const landlord = await ctx.runQuery(api.gdpr.getLandlordByUserId, { userId: args.userId });
    const cleaner = await ctx.runQuery(api.cleaners.getCleanerByUserId, { userId: args.userId });
    const customers = await ctx.runQuery(api.gdpr.getCustomersByUserId, { userId: args.userId });
    const paymentMethods = await ctx.runQuery(api.gdpr.getPaymentMethodsByStripeCustomerIds, {
      customerStripeIds: customers.map((c: any) => c.stripeCustomerId),
    });
    const jobs = landlord
      ? await ctx.runQuery(api.cleaningJobs.getLandlordCleaningJobs, { landlordId: landlord._id })
      : [];

    return {
      generatedAt: new Date().toISOString(),
      user,
      properties,
      landlord,
      cleaner,
      customers,
      paymentMethods,
      cleaningJobs: jobs,
    };
  },
});

// Mutation: Anonymize and deactivate user-related data
export const gdprEraseUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        email: `deleted+${user.userId}@example.invalid`,
        name: null,
        pictureUrl: null,
        phone: null,
        userType: null,
        onboarded: false,
        updatedAt: now,
      } as any);
    }

    // Cleaners
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
    if (cleaner) {
      // Delete HMS card file if any
      if (cleaner.hmsCardFileId) {
        try {
          await ctx.storage.delete(cleaner.hmsCardFileId as any);
        } catch {}
      }
      await ctx.db.patch(cleaner._id, {
        companyId: null,
        hmsCardFileId: null,
        status: 'suspended',
        statusReason: 'GDPR erasure',
        stripeConnectAccountId: null,
        connectAccountStatus: 'disabled',
        payoutSchedule: null,
        bankAccountDetails: undefined,
        isActive: false,
        updatedAt: now,
      } as any);
    }

    // Landlords
    const landlord = await ctx.db
      .query('landlords')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
    if (landlord) {
      await ctx.db.patch(landlord._id, {
        landlordType: null,
        isActive: false,
        updatedAt: now,
      } as any);
    }

    // Properties
    const properties = await ctx.db
      .query('properties')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
    for (const p of properties) {
      await ctx.db.patch(p._id, {
        name: 'Deleted',
        address: '',
        postalCode: null,
        city: null,
        size: null,
        unitDetails: null,
        isActive: false,
        updatedAt: now,
      } as any);
    }

    // cleanerServices table removed - no cleanup needed

    // Customers & payment methods
    const customers = await ctx.db
      .query('customers')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
    const customerStripeIds = new Set(customers.map((c) => c.stripeCustomerId));
    const paymentMethods = await ctx.db.query('paymentMethods').collect();
    for (const pm of paymentMethods) {
      if (customerStripeIds.has(pm.customerId)) {
        await ctx.db.delete(pm._id);
      }
    }
    for (const c of customers) {
      await ctx.db.delete(c._id);
    }

    return { success: true };
  },
});

// Action: Delete external data (Stripe) then anonymize app data
export const requestUserDeletion: any = action({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    // Get Stripe customers to delete
    const customers: any[] = await ctx.runQuery(api.gdpr.getCustomersByUserId, {
      userId: args.userId,
    });
    for (const customer of customers) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stripe/customers/delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stripeCustomerId: customer.stripeCustomerId }),
          }
        );
      } catch {}
    }

    // Mark user as deletion requested
    await ctx.runMutation(api.gdpr.markDeletionRequested, {
      userId: args.userId,
      reason: 'User-initiated deletion',
    });
    return { success: true };
  },
});

// Mutation: mark deletion requested
export const markDeletionRequested = mutation({
  args: {
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
    if (!user) return { success: false };
    await ctx.db.patch(user._id, {
      deletionRequested: true,
      deletionRequestedAt: Date.now(),
      deletionReason: args.reason || null,
      updatedAt: Date.now(),
    } as any);
    return { success: true };
  },
});
