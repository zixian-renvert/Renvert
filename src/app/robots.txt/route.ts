import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.renvert.no';

  const content = [

    '# Created by RenVert',
    '#',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Twitterbot',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '# RSS feed for blog content',
    `# ${siteUrl}/nyheter/rss.xml`,
    `Host: ${siteUrl}`,
  ].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
