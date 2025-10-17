import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    pictureUrl: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    userType: v.union(v.literal('landlord'), v.literal('cleaner'), v.null()),
    onboarded: v.optional(v.boolean()),
    // GDPR deletion markers
    deletionRequested: v.optional(v.boolean()),
    deletionRequestedAt: v.optional(v.number()),
    deletionReason: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_email', ['email'])
    .index('by_userType', ['userType']),

  companies: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_organizationNumber', ['organizationNumber'])
    .index('by_name', ['name']),

  properties: defineTable({
    userId: v.string(),
    companyId: v.union(v.string(), v.null()), // Reference to companies table if company-owned
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
    size: v.union(v.string(), v.null()), // Back to string for normal input
    unitDetails: v.union(v.string(), v.null()), // Optional unit details like apartment number, floor, etc.
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_companyId', ['companyId'])
    .index('by_type', ['type'])
    .index('by_city', ['city'])
    .index('by_isActive', ['isActive']),

  cleaners: defineTable({
    userId: v.string(),
    companyId: v.union(v.string(), v.null()), // Reference to companies table
    hmsCardFileId: v.union(v.string(), v.null()), // Store HMS card file ID from Convex storage
    status: v.optional(
      v.union(
        v.literal('approved'),
        v.literal('pending'),
        v.literal('paused'),
        v.literal('suspended'),
        v.literal('rejected')
      )
    ),
    statusReason: v.optional(v.union(v.string(), v.null())),
    // Stripe Connect fields
    stripeConnectAccountId: v.optional(v.union(v.string(), v.null())),
    connectAccountStatus: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('active'),
        v.literal('restricted'),
        v.literal('disabled')
      )
    ),
    payoutSchedule: v.optional(v.union(v.string(), v.null())),
    bankAccountDetails: v.optional(
      v.object({
        last4: v.string(),
        bankName: v.string(),
        accountType: v.string(),
      })
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_companyId', ['companyId'])
    .index('by_status', ['status'])
    .index('by_isActive', ['isActive']),

  landlords: defineTable({
    userId: v.string(),
    companyId: v.union(v.string(), v.null()), // Reference to companies table
    landlordType: v.union(v.literal('private'), v.literal('company'), v.null()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_companyId', ['companyId'])
    .index('by_landlordType', ['landlordType'])
    .index('by_isActive', ['isActive']),

  // New tables for the booking system
  cleaningJobs: defineTable({
    landlordId: v.string(), // Reference to landlords table
    propertyId: v.id('properties'), // Reference to properties table
    serviceType: v.union(
      v.literal('bnb-cleaning'),
      v.literal('deep-cleaning'),
      v.literal('move-out-cleaning')
    ),
    scheduledDate: v.string(), // ISO date string
    scheduledTime: v.union(v.string(), v.null()), // Optional time preference
    specialInstructions: v.union(v.string(), v.null()),
    status: v.union(
      v.literal('pending'), // Job posted, waiting for cleaner requests
      v.literal('requested'), // Cleaners have requested, waiting for landlord selection
      v.literal('confirmed'), // Landlord selected a cleaner
      v.literal('in-progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    price: v.number(), // Price in NOK
    pricePerDate: v.optional(v.number()), // Price per date if multiple dates
    totalPrice: v.optional(v.number()), // Total price including fees
    platformFee: v.optional(v.number()), // Platform fee amount
    cleanerPayout: v.optional(v.number()), // Amount paid to cleaner
    paymentStatus: v.union(
      v.literal('pending'),
      v.literal('authorized'),
      v.literal('paid'),
      v.literal('refunded'),
      v.literal('failed')
    ),
    payoutStatus: v.optional(v.union(v.literal('pending'), v.literal('paid'), v.literal('failed'))),
    payoutPendingReason: v.optional(v.union(v.string(), v.null())), // Reason why payout is pending
    payoutDate: v.optional(v.number()), // When payout was made
    stripeTransferId: v.optional(v.union(v.string(), v.null())), // Stripe transfer ID
    stripePaymentIntentId: v.optional(v.union(v.string(), v.null())), // Stripe payment intent ID
    assignedCleanerId: v.union(v.string(), v.null()), // Reference to cleaner's userId
    startedAt: v.optional(v.number()), // When the job was started
    startPhotoId: v.optional(v.union(v.string(), v.null())), // Legacy field - kept for existing data
    completedAt: v.optional(v.number()), // When the job was completed
    endPhotoId: v.optional(v.union(v.string(), v.null())), // Legacy field - kept for existing data
    cleanerRating: v.optional(v.number()), // Rating given to cleaner (1-5)
    cleanerFeedback: v.optional(v.union(v.string(), v.null())), // Feedback for cleaner
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_landlordId', ['landlordId'])
    .index('by_propertyId', ['propertyId'])
    .index('by_status', ['status'])
    .index('by_scheduledDate', ['scheduledDate'])
    .index('by_assignedCleanerId', ['assignedCleanerId']),

  // Cleaner requests for jobs
  cleanerRequests: defineTable({
    jobId: v.id('cleaningJobs'),
    cleanerId: v.string(), // Reference to cleaner's userId
    requestedAt: v.number(),
    message: v.optional(v.string()), // Optional message from cleaner
    status: v.union(
      v.literal('pending'), // Request submitted
      v.literal('accepted'), // Landlord selected this cleaner
      v.literal('declined'), // Landlord declined this request
      v.literal('withdrawn') // Cleaner withdrew request
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_jobId', ['jobId'])
    .index('by_cleanerId', ['cleanerId'])
    .index('by_status', ['status']),

  // Platform service pricing
  servicePricing: defineTable({
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
    price: v.number(), // Fixed price in NOK for this size range and service
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_serviceType', ['serviceType'])
    .index('by_sizeRange', ['sizeRange'])
    .index('by_isActive', ['isActive']),

  // Customer and payment information
  customers: defineTable({
    userId: v.string(), // Reference to users table
    stripeCustomerId: v.string(), // Stripe customer ID
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_stripeCustomerId', ['stripeCustomerId'])
    .index('by_email', ['email']),

  // Saved payment methods
  paymentMethods: defineTable({
    customerId: v.string(), // Reference to customers table
    stripePaymentMethodId: v.string(), // Stripe payment method ID
    type: v.string(), // 'card', 'bank_account', etc.
    cardBrand: v.optional(v.string()), // 'visa', 'mastercard', etc.
    cardLast4: v.optional(v.string()),
    cardExpMonth: v.optional(v.number()),
    cardExpYear: v.optional(v.number()),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_customerId', ['customerId'])
    .index('by_stripePaymentMethodId', ['stripePaymentMethodId'])
    .index('by_isDefault', ['isDefault']),

  // Debug logs for Stripe operations
  stripeLogs: defineTable({
    operation: v.string(), // 'capture', 'payout', 'create_payment_intent', etc.
    status: v.union(v.literal('success'), v.literal('error'), v.literal('pending')),
    jobId: v.optional(v.union(v.id('cleaningJobs'), v.null())),
    paymentIntentId: v.optional(v.union(v.string(), v.null())),
    transferId: v.optional(v.union(v.string(), v.null())),
    accountId: v.optional(v.union(v.string(), v.null())),
    amount: v.optional(v.union(v.number(), v.null())),
    errorMessage: v.optional(v.union(v.string(), v.null())),
    requestData: v.optional(v.union(v.string(), v.null())), // JSON stringified request
    responseData: v.optional(v.union(v.string(), v.null())), // JSON stringified response
    createdAt: v.number(),
  })
    .index('by_operation', ['operation'])
    .index('by_status', ['status'])
    .index('by_jobId', ['jobId'])
    .index('by_paymentIntentId', ['paymentIntentId']),

  // Add more tables as needed for your application
});
