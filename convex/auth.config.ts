export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
      // Using Clerk's default JWT template - no need for custom "convex" template
    },
  ]
};