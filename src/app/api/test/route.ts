import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST API ROUTE CALLED ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text();
    console.log('Body:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test API route is working',
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

