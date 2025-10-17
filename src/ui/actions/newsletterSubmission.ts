'use server';
interface NewsletterSubmissionData {
  email: string;
  name: string;
  company?: string;
}

export async function newsletterSubmission(data: NewsletterSubmissionData) {
  const medalapi = process.env.MEDAL_API_ENDPOINT;
  const medalclientid = process.env.MEDAL_SOCIAL_CLIENT_ID;
  const medalclientsecret = process.env.MEDAL_SOCIAL_CLIENT_SECRET;
  if (!medalapi || !medalclientid || !medalclientsecret) {
    return { error: 'Missing environment variables' };
  }
  try {
    const response = await fetch(`${medalapi}/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': medalclientid,
        'Client-Secret': medalclientsecret,
      },
      body: JSON.stringify([
        {
          email: data.email,
          name: data.name,
          company: data.company,
          source: 'website',
        },
      ]),
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to submit newsletter' };
  }
}
