import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Update an existing property
export const updateProperty = mutation({
  args: {
    propertyId: v.id('properties'),
    updates: v.object({
      name: v.optional(v.string()),
      type: v.optional(
        v.union(
          v.literal('apartment'),
          v.literal('hytte'),
          v.literal('office'),
          v.literal('house'),
          v.literal('commercial'),
          v.literal('other')
        )
      ),
      address: v.optional(v.string()),
      postalCode: v.optional(v.union(v.string(), v.null())),
      city: v.optional(v.union(v.string(), v.null())),
      size: v.optional(v.union(v.string(), v.null())),
      unitDetails: v.optional(v.union(v.string(), v.null())),
      isActive: v.optional(v.boolean()),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { propertyId, updates } = args;

    // Get the existing property to verify ownership
    const existingProperty = await ctx.db.get(propertyId);
    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Update the property
    const updatedProperty = await ctx.db.patch(propertyId, updates);
    return updatedProperty;
  },
});

// Get a property by ID
export const getPropertyById = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    return property;
  },
});

// Get properties by user ID
export const getPropertiesByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query('properties')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    return properties;
  },
});
