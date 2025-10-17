import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const data = await (convex as any).action((api as any).gdpr.exportUserData, { userId });
    return NextResponse.json(data);
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
