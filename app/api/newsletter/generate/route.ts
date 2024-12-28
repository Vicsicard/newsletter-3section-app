import { NextRequest, NextResponse } from 'next/server';
import { generateNewsletterContent } from '@/utils/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { newsletterId } = await request.json();
    
    const result = await generateNewsletterContent(newsletterId);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    }, { status: 500 });
  }
}