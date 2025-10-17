'use server';

interface ContactSubmissionData {
  email: string;
  name: string;
  company?: string;
  phone?: string;
  message?: string;
}

export async function contactSubmission(data: ContactSubmissionData) {
  const medalapi = process.env.MEDAL_API_ENDPOINT;
  const medalclientid = process.env.MEDAL_SOCIAL_CLIENT_ID;
  const medalclientsecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET;
  if (!medalapi || !medalclientid || !medalclientsecret) {
    return { error: 'Missing environment variables' };
  }
  try {
    const response = await fetch(`${medalapi}/v1/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': medalclientid,
        'Client-Secret': medalclientsecret,
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        company: data.company,
        phone: data.phone,
        content: data.message,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    return { error: 'Failed to submit contact form' };
  }
}
