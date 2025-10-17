/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as cleanerRequests from "../cleanerRequests.js";
import type * as cleaners from "../cleaners.js";
import type * as cleaningJobs from "../cleaningJobs.js";
import type * as crons from "../crons.js";
import type * as fileStorage from "../fileStorage.js";
import type * as gdpr from "../gdpr.js";
import type * as notifications from "../notifications.js";
import type * as properties from "../properties.js";
import type * as servicePricing from "../servicePricing.js";
import type * as stripeConnect from "../stripeConnect.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cleanerRequests: typeof cleanerRequests;
  cleaners: typeof cleaners;
  cleaningJobs: typeof cleaningJobs;
  crons: typeof crons;
  fileStorage: typeof fileStorage;
  gdpr: typeof gdpr;
  notifications: typeof notifications;
  properties: typeof properties;
  servicePricing: typeof servicePricing;
  stripeConnect: typeof stripeConnect;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
