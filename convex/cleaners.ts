import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get cleaner by user ID
export const getCleanerByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
  },
});

// Get cleaner by ID
export const getCleanerById = query({
  args: { cleanerId: v.id('cleaners') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.cleanerId);
  },
});

// Create a cleaner profile if missing
export const createCleanerIfMissing = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true, updatedAt: Date.now() });
      }
      return existing._id;
    }

    const now = Date.now();
    const cleanerId = await ctx.db.insert('cleaners', {
      userId: args.userId,
      companyId: null,
      hmsCardFileId: null,
      status: 'approved',
      statusReason: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return cleanerId;
  },
});

// Get all cleaners with optional status filter
export const getCleaners = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('approved'),
        v.literal('pending'),
        v.literal('paused'),
        v.literal('suspended'),
        v.literal('rejected')
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('cleaners')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();
    }

    return await ctx.db
      .query('cleaners')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

// Update cleaner status
export const updateCleanerStatus = mutation({
  args: {
    userId: v.string(),
    status: v.union(
      v.literal('approved'),
      v.literal('pending'),
      v.literal('paused'),
      v.literal('suspended'),
      v.literal('rejected')
    ),
    statusReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!cleaner) {
      throw new Error('Cleaner not found');
    }

    return await ctx.db.patch(cleaner._id, {
      status: args.status,
      statusReason: args.statusReason || null,
      updatedAt: Date.now(),
    });
  },
});

// Pause cleaner account
export const pauseCleanerAccount = mutation({
  args: {
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!cleaner) {
      throw new Error('Cleaner not found');
    }

    return await ctx.db.patch(cleaner._id, {
      status: 'paused',
      statusReason: args.reason || 'Account paused by user',
      updatedAt: Date.now(),
    });
  },
});

// Resume cleaner account
export const resumeCleanerAccount = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!cleaner) {
      throw new Error('Cleaner not found');
    }

    return await ctx.db.patch(cleaner._id, {
      status: 'approved',
      statusReason: null,
      updatedAt: Date.now(),
    });
  },
});

// Suspend cleaner account (admin action)
export const suspendCleanerAccount = mutation({
  args: {
    userId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!cleaner) {
      throw new Error('Cleaner not found');
    }

    return await ctx.db.patch(cleaner._id, {
      status: 'suspended',
      statusReason: args.reason,
      updatedAt: Date.now(),
    });
  },
});

// Get cleaner status history (you might want to create a separate table for this)
export const getCleanerStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cleaner = await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!cleaner) {
      return null;
    }

    return {
      status: cleaner.status,
      statusReason: cleaner.statusReason,
      lastUpdated: cleaner.updatedAt,
    };
  },
});
