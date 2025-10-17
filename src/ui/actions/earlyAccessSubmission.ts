'use server';

interface EarlyAccessSubmissionData {
  email: string;
  name: string;
  company?: string;
  isHost: boolean;
}

export async function earlyAccessSubmission(data: EarlyAccessSubmissionData) {
  const medalapi = process.env.MEDAL_API_ENDPOINT;
  const medalclientid = process.env.MEDAL_SOCIAL_CLIENT_ID;
  const medalclientsecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET;

  if (!medalapi || !medalclientid || !medalclientsecret) {
    console.error('[earlyAccessSubmission] Missing envs', {
      MEDAL_API_ENDPOINT: Boolean(medalapi),
      MEDAL_SOCIAL_CLIENT_ID: Boolean(medalclientid),
      MEDAL_SOCIAL_CLIENT_SECRET: Boolean(medalclientsecret),
    });
    return { error: 'Missing environment variables' };
  }

  try {
    const payload = [
      {
        email: data.email,
        name: data.name,
        company: data.company || '',
        source: 'website',
      },
    ];

    const response = await fetch(`${medalapi}/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': medalclientid,
        'Client-Secret': medalclientsecret,
      },
      body: JSON.stringify(payload),
    });
    const rawText = await response.text();
    if (!response.ok) {
      console.error('[earlyAccessSubmission] Non-OK response', {
        status: response.status,
        statusText: response.statusText,
        body: rawText,
      });
      // Try to parse JSON error shape if present
      try {
        const json = JSON.parse(rawText);
        return { error: 'API error', status: response.status, data: json };
      } catch {
        return { error: 'API error', status: response.status, body: rawText };
      }
    }
    try {
      const json = JSON.parse(rawText);
      return json;
    } catch (_e) {
      // Fallback for non-JSON success
      return { ok: true, data: rawText } as any;
    }
  } catch (error) {
    console.error('[earlyAccessSubmission] Network error:', error);
    return { error: 'Failed to submit early access form' };
  }
}
