import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get pricing for a specific service type and size range
export const getServicePricing = query({
  args: {
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    sizeRange: v.union(
      v.literal('0-30'),
      v.literal('31-40'),
      v.literal('41-50'),
      v.literal('51-60'),
      v.literal('61-70'),
      v.literal('71-80'),
      v.literal('81-90'),
      v.literal('91-100'),
      v.literal('101-110'),
      v.literal('111-120'),
      v.literal('121-130'),
      v.literal('131-140'),
      v.literal('141-150'),
      v.literal('151-160'),
      v.literal('161-170'),
      v.literal('171-180'),
      v.literal('181-190'),
      v.literal('191-200'),
      v.literal('201-210'),
      v.literal('211-220'),
      v.literal('221-230'),
      v.literal('231-240'),
      v.literal('241-250'),
      v.literal('251-260'),
      v.literal('261-270'),
      v.literal('271-280'),
      v.literal('281-290'),
      v.literal('291-300')
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('servicePricing')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', args.serviceType))
      .filter((q) => q.eq(q.field('sizeRange'), args.sizeRange))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
  },
});

// Get all active service pricing
export const getAllServicePricing = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('servicePricing')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .collect();
  },
});

// Calculate price for a service based on property size
export const calculateServicePrice = query({
  args: {
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    propertySize: v.string(), // Property size in m² (e.g., "75", "120", etc.)
  },
  handler: async (ctx, args) => {
    // Parse property size and determine size range
    const sizeInM2 = Number.parseFloat(args.propertySize);
    let sizeRange: '0-30' | '31-40' | '41-50' | '51-60' | '61-70' | '71-80' | '81-90' | '91-100' | '101-110' | '111-120' | '121-130' | '131-140' | '141-150' | '151-160' | '161-170' | '171-180' | '181-190' | '191-200' | '201-210' | '211-220' | '221-230' | '231-240' | '241-250' | '251-260' | '261-270' | '271-280' | '281-290' | '291-300';

    if (sizeInM2 <= 30) {
      sizeRange = '0-30';
    } else if (sizeInM2 <= 40) {
      sizeRange = '31-40';
    } else if (sizeInM2 <= 50) {
      sizeRange = '41-50';
    } else if (sizeInM2 <= 60) {
      sizeRange = '51-60';
    } else if (sizeInM2 <= 70) {
      sizeRange = '61-70';
    } else if (sizeInM2 <= 80) {
      sizeRange = '71-80';
    } else if (sizeInM2 <= 90) {
      sizeRange = '81-90';
    } else if (sizeInM2 <= 100) {
      sizeRange = '91-100';
    } else if (sizeInM2 <= 110) {
      sizeRange = '101-110';
    } else if (sizeInM2 <= 120) {
      sizeRange = '111-120';
    } else if (sizeInM2 <= 130) {
      sizeRange = '121-130';
    } else if (sizeInM2 <= 140) {
      sizeRange = '131-140';
    } else if (sizeInM2 <= 150) {
      sizeRange = '141-150';
    } else if (sizeInM2 <= 160) {
      sizeRange = '151-160';
    } else if (sizeInM2 <= 170) {
      sizeRange = '161-170';
    } else if (sizeInM2 <= 180) {
      sizeRange = '171-180';
    } else if (sizeInM2 <= 190) {
      sizeRange = '181-190';
    } else if (sizeInM2 <= 200) {
      sizeRange = '191-200';
    } else if (sizeInM2 <= 210) {
      sizeRange = '201-210';
    } else if (sizeInM2 <= 220) {
      sizeRange = '211-220';
    } else if (sizeInM2 <= 230) {
      sizeRange = '221-230';
    } else if (sizeInM2 <= 240) {
      sizeRange = '231-240';
    } else if (sizeInM2 <= 250) {
      sizeRange = '241-250';
    } else if (sizeInM2 <= 260) {
      sizeRange = '251-260';
    } else if (sizeInM2 <= 270) {
      sizeRange = '261-270';
    } else if (sizeInM2 <= 280) {
      sizeRange = '271-280';
    } else if (sizeInM2 <= 290) {
      sizeRange = '281-290';
    } else if (sizeInM2 <= 300) {
      sizeRange = '291-300';
    } else {
      // For properties larger than 300m², use the highest tier
      sizeRange = '291-300';
    }

    // Get pricing for the determined size range
    const pricing = await ctx.db
      .query('servicePricing')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', args.serviceType))
      .filter((q) => q.eq(q.field('sizeRange'), sizeRange))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!pricing) {
      return null;
    }

    return {
      serviceType: args.serviceType,
      propertySize: args.propertySize,
      sizeRange: sizeRange,
      price: pricing.price,
      isActive: pricing.isActive,
    };
  },
});

// Calculate price for a service based on property size
export const calculateServicePriceByProperty = query({
  args: {
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    propertySize: v.string(), // Property size in m² (e.g., "75", "120", etc.)
  },
  handler: async (ctx, args) => {
    const { serviceType, propertySize } = args;

    // Convert property size to size range
    const size = Number.parseInt(propertySize);
    let sizeRange: string;

    // BNB-cleaning is only available up to 100 sqm
    if (serviceType === 'bnb-cleaning' && size > 100) {
      // Cap at the highest tier for BNB-cleaning
      sizeRange = '91-100';
    } else if (size <= 30) sizeRange = '0-30';
    else if (size <= 40) sizeRange = '31-40';
    else if (size <= 50) sizeRange = '41-50';
    else if (size <= 60) sizeRange = '51-60';
    else if (size <= 70) sizeRange = '61-70';
    else if (size <= 80) sizeRange = '71-80';
    else if (size <= 90) sizeRange = '81-90';
    else if (size <= 100) sizeRange = '91-100';
    else if (size <= 110) sizeRange = '101-110';
    else if (size <= 120) sizeRange = '111-120';
    else if (size <= 130) sizeRange = '121-130';
    else if (size <= 140) sizeRange = '131-140';
    else if (size <= 150) sizeRange = '141-150';
    else if (size <= 160) sizeRange = '151-160';
    else if (size <= 170) sizeRange = '161-170';
    else if (size <= 180) sizeRange = '171-180';
    else if (size <= 190) sizeRange = '181-190';
    else if (size <= 200) sizeRange = '191-200';
    else if (size <= 210) sizeRange = '201-210';
    else if (size <= 220) sizeRange = '211-220';
    else if (size <= 230) sizeRange = '221-230';
    else if (size <= 240) sizeRange = '231-240';
    else if (size <= 250) sizeRange = '241-250';
    else if (size <= 260) sizeRange = '251-260';
    else if (size <= 270) sizeRange = '261-270';
    else if (size <= 280) sizeRange = '271-280';
    else if (size <= 290) sizeRange = '281-290';
    else if (size <= 300) sizeRange = '291-300';
    else sizeRange = '291-300'; // For properties larger than 300m², use the highest tier

    // Get pricing for this service type and size range
    const pricing = await ctx.db
      .query('servicePricing')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', serviceType))
      .filter((q) => q.eq(q.field('sizeRange'), sizeRange))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!pricing) {
      throw new Error(`No pricing found for ${serviceType} at size range ${sizeRange}`);
    }

    const basePrice = pricing.price;

    // Calculate platform fee (10% of base price)
    const platformFee = Math.round(basePrice * 0.1);

    // Calculate cleaner payout (90% of base price)
    const cleanerPayout = basePrice - platformFee;

    return {
      basePrice,
      platformFee,
      cleanerPayout,
      sizeRange,
      serviceType,
    };
  },
});

// Admin function to set service pricing (for platform management)
export const setServicePricing = mutation({
  args: {
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    sizeRange: v.union(
      v.literal('0-30'),
      v.literal('31-40'),
      v.literal('41-50'),
      v.literal('51-60'),
      v.literal('61-70'),
      v.literal('71-80'),
      v.literal('81-90'),
      v.literal('91-100'),
      v.literal('101-110'),
      v.literal('111-120'),
      v.literal('121-130'),
      v.literal('131-140'),
      v.literal('141-150'),
      v.literal('151-160'),
      v.literal('161-170'),
      v.literal('171-180'),
      v.literal('181-190'),
      v.literal('191-200'),
      v.literal('201-210'),
      v.literal('211-220'),
      v.literal('221-230'),
      v.literal('231-240'),
      v.literal('241-250'),
      v.literal('251-260'),
      v.literal('261-270'),
      v.literal('271-280'),
      v.literal('281-290'),
      v.literal('291-300')
    ),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if pricing already exists
    const existingPricing = await ctx.db
      .query('servicePricing')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', args.serviceType))
      .filter((q) => q.eq(q.field('sizeRange'), args.sizeRange))
      .first();

    if (existingPricing) {
      // Update existing pricing
      return await ctx.db.patch(existingPricing._id, {
        price: args.price,
        updatedAt: now,
      });
    }
    // Create new pricing
    return await ctx.db.insert('servicePricing', {
      serviceType: args.serviceType,
      sizeRange: args.sizeRange,
      price: args.price,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Initialize default pricing for all services - updates existing and creates new entries
export const initializeDefaultPricing = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // BNB Cleaning prices (BNB-vask) - up to 100 sqm
    const bnbCleaningPricing = [
      { sizeRange: '0-30' as const, price: 749 },
      { sizeRange: '31-40' as const, price: 899 },
      { sizeRange: '41-50' as const, price: 1049 },
      { sizeRange: '51-60' as const, price: 1199 },
      { sizeRange: '61-70' as const, price: 1349 },
      { sizeRange: '71-80' as const, price: 1499 },
      { sizeRange: '81-90' as const, price: 1649 },
      { sizeRange: '91-100' as const, price: 1799 },
    ];

    // Deep Cleaning prices (Standardvask) - up to 300 sqm
    const deepCleaningPricing = [
      { sizeRange: '0-30' as const, price: 749 },
      { sizeRange: '31-40' as const, price: 899 },
      { sizeRange: '41-50' as const, price: 1049 },
      { sizeRange: '51-60' as const, price: 1199 },
      { sizeRange: '61-70' as const, price: 1349 },
      { sizeRange: '71-80' as const, price: 1499 },
      { sizeRange: '81-90' as const, price: 1649 },
      { sizeRange: '91-100' as const, price: 1799 },
      { sizeRange: '101-110' as const, price: 1949 },
      { sizeRange: '111-120' as const, price: 2099 },
      { sizeRange: '121-130' as const, price: 2249 },
      { sizeRange: '131-140' as const, price: 2399 },
      { sizeRange: '141-150' as const, price: 2549 },
      { sizeRange: '151-160' as const, price: 2699 },
      { sizeRange: '161-170' as const, price: 2849 },
      { sizeRange: '171-180' as const, price: 2999 },
      { sizeRange: '181-190' as const, price: 3149 },
      { sizeRange: '191-200' as const, price: 3299 },
      { sizeRange: '201-210' as const, price: 3449 },
      { sizeRange: '211-220' as const, price: 3599 },
      { sizeRange: '221-230' as const, price: 3749 },
      { sizeRange: '231-240' as const, price: 3899 },
      { sizeRange: '241-250' as const, price: 4049 },
      { sizeRange: '251-260' as const, price: 4199 },
      { sizeRange: '261-270' as const, price: 4349 },
      { sizeRange: '271-280' as const, price: 4499 },
      { sizeRange: '281-290' as const, price: 4649 },
      { sizeRange: '291-300' as const, price: 4799 },
    ];

    // Move-out Cleaning prices (Flyttevask) - up to 300 sqm
    const moveOutCleaningPricing = [
      { sizeRange: '0-30' as const, price: 1749 },
      { sizeRange: '31-40' as const, price: 1998 },
      { sizeRange: '41-50' as const, price: 2247 },
      { sizeRange: '51-60' as const, price: 2496 },
      { sizeRange: '61-70' as const, price: 2745 },
      { sizeRange: '71-80' as const, price: 2994 },
      { sizeRange: '81-90' as const, price: 3243 },
      { sizeRange: '91-100' as const, price: 3492 },
      { sizeRange: '101-110' as const, price: 3741 },
      { sizeRange: '111-120' as const, price: 3990 },
      { sizeRange: '121-130' as const, price: 4239 },
      { sizeRange: '131-140' as const, price: 4488 },
      { sizeRange: '141-150' as const, price: 4737 },
      { sizeRange: '151-160' as const, price: 4986 },
      { sizeRange: '161-170' as const, price: 5235 },
      { sizeRange: '171-180' as const, price: 5484 },
      { sizeRange: '181-190' as const, price: 5733 },
      { sizeRange: '191-200' as const, price: 5982 },
      { sizeRange: '201-210' as const, price: 6231 },
      { sizeRange: '211-220' as const, price: 6480 },
      { sizeRange: '221-230' as const, price: 6729 },
      { sizeRange: '231-240' as const, price: 6978 },
      { sizeRange: '241-250' as const, price: 7227 },
      { sizeRange: '251-260' as const, price: 7476 },
      { sizeRange: '261-270' as const, price: 7725 },
      { sizeRange: '271-280' as const, price: 7974 },
      { sizeRange: '281-290' as const, price: 8223 },
      { sizeRange: '291-300' as const, price: 8472 },
    ];

    const results = {
      created: 0,
      updated: 0,
      total: 0,
    };

    // Initialize/Update BNB Cleaning pricing
    for (const pricing of bnbCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'bnb-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'bnb-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    // Initialize/Update Deep Cleaning pricing
    for (const pricing of deepCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'deep-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'deep-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    // Initialize/Update Move-out Cleaning pricing
    for (const pricing of moveOutCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'move-out-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'move-out-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    return results;
  },
});

// Update all pricing - creates new entries and updates existing ones
export const updateAllPricing = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // BNB Cleaning prices (BNB-vask) - up to 100 sqm
    const bnbCleaningPricing = [
      { sizeRange: '0-30' as const, price: 749 },
      { sizeRange: '31-40' as const, price: 899 },
      { sizeRange: '41-50' as const, price: 1049 },
      { sizeRange: '51-60' as const, price: 1199 },
      { sizeRange: '61-70' as const, price: 1349 },
      { sizeRange: '71-80' as const, price: 1499 },
      { sizeRange: '81-90' as const, price: 1649 },
      { sizeRange: '91-100' as const, price: 1799 },
    ];

    // Deep Cleaning prices (Standardvask) - up to 300 sqm
    const deepCleaningPricing = [
      { sizeRange: '0-30' as const, price: 749 },
      { sizeRange: '31-40' as const, price: 899 },
      { sizeRange: '41-50' as const, price: 1049 },
      { sizeRange: '51-60' as const, price: 1199 },
      { sizeRange: '61-70' as const, price: 1349 },
      { sizeRange: '71-80' as const, price: 1499 },
      { sizeRange: '81-90' as const, price: 1649 },
      { sizeRange: '91-100' as const, price: 1799 },
      { sizeRange: '101-110' as const, price: 1949 },
      { sizeRange: '111-120' as const, price: 2099 },
      { sizeRange: '121-130' as const, price: 2249 },
      { sizeRange: '131-140' as const, price: 2399 },
      { sizeRange: '141-150' as const, price: 2549 },
      { sizeRange: '151-160' as const, price: 2699 },
      { sizeRange: '161-170' as const, price: 2849 },
      { sizeRange: '171-180' as const, price: 2999 },
      { sizeRange: '181-190' as const, price: 3149 },
      { sizeRange: '191-200' as const, price: 3299 },
      { sizeRange: '201-210' as const, price: 3449 },
      { sizeRange: '211-220' as const, price: 3599 },
      { sizeRange: '221-230' as const, price: 3749 },
      { sizeRange: '231-240' as const, price: 3899 },
      { sizeRange: '241-250' as const, price: 4049 },
      { sizeRange: '251-260' as const, price: 4199 },
      { sizeRange: '261-270' as const, price: 4349 },
      { sizeRange: '271-280' as const, price: 4499 },
      { sizeRange: '281-290' as const, price: 4649 },
      { sizeRange: '291-300' as const, price: 4799 },
    ];

    // Move-out Cleaning prices (Flyttevask) - up to 300 sqm
    const moveOutCleaningPricing = [
      { sizeRange: '0-30' as const, price: 1749 },
      { sizeRange: '31-40' as const, price: 1998 },
      { sizeRange: '41-50' as const, price: 2247 },
      { sizeRange: '51-60' as const, price: 2496 },
      { sizeRange: '61-70' as const, price: 2745 },
      { sizeRange: '71-80' as const, price: 2994 },
      { sizeRange: '81-90' as const, price: 3243 },
      { sizeRange: '91-100' as const, price: 3492 },
      { sizeRange: '101-110' as const, price: 3741 },
      { sizeRange: '111-120' as const, price: 3990 },
      { sizeRange: '121-130' as const, price: 4239 },
      { sizeRange: '131-140' as const, price: 4488 },
      { sizeRange: '141-150' as const, price: 4737 },
      { sizeRange: '151-160' as const, price: 4986 },
      { sizeRange: '161-170' as const, price: 5235 },
      { sizeRange: '171-180' as const, price: 5484 },
      { sizeRange: '181-190' as const, price: 5733 },
      { sizeRange: '191-200' as const, price: 5982 },
      { sizeRange: '201-210' as const, price: 6231 },
      { sizeRange: '211-220' as const, price: 6480 },
      { sizeRange: '221-230' as const, price: 6729 },
      { sizeRange: '231-240' as const, price: 6978 },
      { sizeRange: '241-250' as const, price: 7227 },
      { sizeRange: '251-260' as const, price: 7476 },
      { sizeRange: '261-270' as const, price: 7725 },
      { sizeRange: '271-280' as const, price: 7974 },
      { sizeRange: '281-290' as const, price: 8223 },
      { sizeRange: '291-300' as const, price: 8472 },
    ];

    const results = {
      created: 0,
      updated: 0,
      total: 0,
    };

    // Update BNB Cleaning pricing
    for (const pricing of bnbCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'bnb-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'bnb-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    // Update Deep Cleaning pricing
    for (const pricing of deepCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'deep-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'deep-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    // Update Move-out Cleaning pricing
    for (const pricing of moveOutCleaningPricing) {
      const existing = await ctx.db
        .query('servicePricing')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', 'move-out-cleaning'))
        .filter((q) => q.eq(q.field('sizeRange'), pricing.sizeRange))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price: pricing.price,
          isActive: true,
          updatedAt: now,
        });
        results.updated++;
      } else {
        await ctx.db.insert('servicePricing', {
          serviceType: 'move-out-cleaning',
          sizeRange: pricing.sizeRange,
          price: pricing.price,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      }
      results.total++;
    }

    return results;
  },
});

// Migrate existing cleaning jobs to include new fields
export const migrateCleaningJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query('cleaningJobs').collect();
    let updatedCount = 0;

    for (const job of jobs) {
      // Check if job has the new fields
      if (job.platformFee === undefined || job.cleanerPayout === undefined) {
        // Calculate platform fee and cleaner payout based on total price
        const platformFee = Math.round((job.totalPrice || job.price || 0) * 0.1);
        const cleanerPayout = (job.totalPrice || job.price || 0) - platformFee;

        await ctx.db.patch(job._id, {
          platformFee,
          cleanerPayout,
          payoutStatus: 'pending',
          updatedAt: Date.now(),
        });
        updatedCount++;
      }
    }

    return { updatedCount, totalJobs: jobs.length };
  },
});
