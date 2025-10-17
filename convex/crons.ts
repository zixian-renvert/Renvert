import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at 2 AM UTC to process pending payouts
crons.daily(
  "process pending payouts",
  { hourUTC: 2, minuteUTC: 0 },
  internal.stripeConnect.processPendingPayouts
);

export default crons;

