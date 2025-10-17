import MedalSocialClient from '@medalsocial/sdk';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { action, mutation, query } from './_generated/server';
import { notifyCleanerOnboardingComplete } from './notifications';

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existingUser) {
      // Update existing user - don't change onboarded status
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name || null,
        pictureUrl: args.pictureUrl || null,
        updatedAt: Date.now(),
      });
    }

    // Create new user with onboarded: false by default
    const insertedId = await ctx.db.insert('users', {
      userId: args.userId,
      email: args.email,
      name: args.name || null,
      pictureUrl: args.pictureUrl || null,
      phone: null,
      userType: null,
      onboarded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Fire-and-forget: create Medal lead in background (non-blocking)
    try {
      await ctx.scheduler.runAfter(0, (api as any).users.createUserAndLead, args as any);
    } catch (_e) {
      // If scheduler is unavailable in this environment, ignore silently
    }

    return insertedId;
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

export const getUserByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();
  },
});

export const markUserOnboarded = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    return await ctx.db.patch(user._id, {
      onboarded: true,
      updatedAt: Date.now(),
    });
  },
});

// New mutations for onboarding data
export const completeOnboarding = mutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal('landlord'), v.literal('cleaner')),
    name: v.string(),
    phone: v.string(),
    // Company data (if applicable)
    companyData: v.optional(
      v.object({
        organizationNumber: v.string(),
        name: v.string(),
        organizationForm: v.union(v.string(), v.null()),
        businessAddress: v.union(
          v.object({
            address: v.union(v.string(), v.array(v.string())),
            postalCode: v.string(),
            city: v.string(),
            country: v.string(),
          }),
          v.null()
        ),
      })
    ),
    // Landlord-specific data
    landlordData: v.optional(
      v.object({
        landlordType: v.union(v.literal('private'), v.literal('company')),
        properties: v.array(
          v.object({
            name: v.string(),
            type: v.union(
              v.literal('apartment'),
              v.literal('hytte'),
              v.literal('office'),
              v.literal('house'),
              v.literal('commercial'),
              v.literal('other')
            ),
            address: v.string(),
            postalCode: v.union(v.string(), v.null()),
            city: v.union(v.string(), v.null()),
            size: v.string(),
            unitDetails: v.union(v.string(), v.null()),
          })
        ),
      })
    ),
    // Cleaner-specific data
    cleanerData: v.optional(
      v.object({
        hmsCardFileId: v.union(v.string(), v.null()),
        services: v.optional(
          v.array(
            v.object({
              serviceType: v.union(
                v.literal('bnb-cleaning'),
                v.literal('deep-cleaning'),
                v.literal('move-out-cleaning')
              ),
            })
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update user with basic info
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      phone: args.phone,
      userType: args.userType,
      onboarded: true,
      updatedAt: now,
    });

    let companyId: string | null = null;

    // Create company if company data is provided
    if (args.companyData) {
      const company = await ctx.db.insert('companies', {
        ...args.companyData,
        createdAt: now,
        updatedAt: now,
      });
      companyId = company;
    }

    // Create landlord record if applicable
    if (args.userType === 'landlord' && args.landlordData) {
      await ctx.db.insert('landlords', {
        userId: args.userId,
        companyId,
        landlordType: args.landlordData.landlordType,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Create properties
      for (const property of args.landlordData.properties) {
        await ctx.db.insert('properties', {
          userId: args.userId,
          companyId,
          name: property.name,
          type: property.type,
          address: property.address,
          postalCode: property.postalCode,
          city: property.city,
          size: property.size,
          unitDetails: property.unitDetails,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Create cleaner record if applicable
    if (args.userType === 'cleaner' && args.cleanerData) {
      const cleanerId = await ctx.db.insert('cleaners', {
        userId: args.userId,
        companyId,
        hmsCardFileId: args.cleanerData.hmsCardFileId,
        status: 'approved', // Default status for new cleaners
        statusReason: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Send notification to Google Chat about new cleaner onboarding
      try {
        await ctx.scheduler.runAfter(0, notifyCleanerOnboardingComplete, {
          cleanerId,
          userId: args.userId,
          userName: args.name,
          userEmail: user.email,
          companyName: args.companyData?.name,
        });
      } catch (error) {
        console.error('Failed to schedule cleaner onboarding notification:', error);
        // Don't fail the onboarding if notification fails
      }

      // cleanerServices table removed - services are now handled through job requests
    }

    return { success: true };
  },
});

// Action: Create or update user record, and if this is the first time we see this user
// create a Lead in Medal via @medalsocial/sdk.
export const createUserAndLead: any = action({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ createdLead: boolean; reason?: string; error?: string }> => {
    'use node';

    // Check if user already exists before we upsert
    const existing = await ctx.runQuery(api.users.getUserById, { userId: args.userId });

    // Upsert user using existing mutation
    await ctx.runMutation(api.users.createUser, args);

    // If the user already existed, do not create another lead
    if (existing) {
      return { createdLead: false, reason: 'already_exists' };
    }

    // Create Medal lead for first-time users
    try {
      const clientId = process.env.MEDAL_SOCIAL_CLIENT_ID as string | undefined;
      const clientSecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET as string | undefined;
      if (!clientId || !clientSecret) {
        console.error('[createUserAndLead] Missing Medal credentials');
        return { createdLead: false, reason: 'missing_credentials' };
      }

      const client = new MedalSocialClient({
        auth: { kind: 'basic', clientId, clientSecret },
        baseUrl: process.env.MEDAL_API_ENDPOINT || undefined,
        userAgent: '@medalsocial/renvert',
      } as any);

      await client.createLead([
        {
          name: args.name || '',
          email: args.email,
          company: '',
          source: 'signup',
        },
      ]);

      return { createdLead: true };
    } catch (error) {
      console.error('[createUserAndLead] Failed to create Medal lead', error);
      return { createdLead: false, error: 'sdk_error' };
    }
  },
});

// Queries for the new tables
export const getCompanyByOrganizationNumber = query({
  args: { organizationNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companies')
      .withIndex('by_organizationNumber', (q) =>
        q.eq('organizationNumber', args.organizationNumber)
      )
      .first();
  },
});

export const getUserProperties = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('properties')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

export const getUserCleaner = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('cleaners')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
  },
});

export const getUserLandlord = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('landlords')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
  },
});

export const getPropertiesByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('properties')
      .withIndex('by_city', (q) => q.eq('city', args.city))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});
