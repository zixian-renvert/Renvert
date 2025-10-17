import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/lib/env";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const client = createClient({
  projectId,
  dataset,
  // token, // for private datasets
  apiVersion,
  useCdn: true,
});

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Configure image handling
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },

  async redirects() {
    const sanityRedirects = await client.fetch(groq`*[_type == 'redirect']{
			source,
			'destination': select(
				destination.type == 'internal' =>
					select(
						destination.internal->._type == 'blog.post' => '/nyheter/',
						'/'
					) + destination.internal->.metadata.slug.current,
				destination.external
			),
			permanent
		}`);
    return [
      ...sanityRedirects,
      {
        source: "/nb/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },

  env: {
    SC_DISABLE_SPEEDY: "false", // makes styled-components as fast in dev mode as it is in production mode
  },
} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin({});

export default withNextIntl(config);
