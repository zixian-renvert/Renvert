import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const { userId: bodyUserId, reason } = await request.json();
    const authResult = await auth();
    const userId = authResult?.userId || bodyUserId;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Gather user info (best-effort); don't fail deletion request if this lookup fails
    const email: string | undefined = undefined;
    const name: string | undefined = undefined;

    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Missing GOOGLE_CHAT_WEBHOOK_URL');
      return NextResponse.json(
        { success: false, error: 'Missing GOOGLE_CHAT_WEBHOOK_URL' },
        { status: 500 }
      );
    }

    const text = `GDPR deletion requested\n- User ID: ${userId}\n- Name: ${name || 'N/A'}\n- Email: ${email || 'N/A'}\n- Reason: ${reason || 'N/A'}\n- Requested At: ${new Date().toISOString()}`;
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => '');
      console.error('Google Chat webhook failed', resp.status, bodyText);
      return NextResponse.json(
        {
          success: false,
          error: `Webhook failed with ${resp.status}`,
          details: bodyText?.slice(0, 500),
        },
        { status: 500 }
      );
    }

    try {
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      await convex.mutation(api.gdpr.markDeletionRequested, {
        userId,
        reason: reason || 'User request',
      });
    } catch (e) {
      console.warn('Failed to mark deletion requested in DB:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Deletion request received. We will process it within 30 days.',
    });
  } catch (error: any) {
    console.error('GDPR delete error:', error);
    return NextResponse.json(
      { error: 'Failed to submit deletion request', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
