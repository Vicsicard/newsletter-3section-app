import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Attempting to fetch newsletter with ID:', params.id);
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Service Role Key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // First try the new schema
    let { data: newsletter, error } = await supabaseAdmin
      .from('newsletters')
      .select(`
        *,
        companies (
          company_name,
          industry,
          contact_email
        ),
        newsletter_sections (
          id,
          section_number,
          heading,
          body,
          replicate_image_url
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error with new schema:', error);
      // Try fallback to old schema
      const { data: oldNewsletter, error: oldError } = await supabaseAdmin
        .from('newsletters')
        .select(`
          *,
          companies (
            company_name,
            industry,
            contact_email
          )
        `)
        .eq('id', params.id)
        .single();

      if (oldError) {
        console.error('Error with old schema:', oldError);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch newsletter with both schemas', details: { newError: error, oldError } },
          { status: 500 }
        );
      }
      newsletter = oldNewsletter;
    }

    if (!newsletter) {
      return NextResponse.json(
        { success: false, message: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Transform the data to ensure consistent format
    const transformedNewsletter = {
      ...newsletter,
      sections: newsletter.newsletter_sections || []
    };

    return NextResponse.json({
      success: true,
      data: transformedNewsletter
    });
  } catch (error) {
    console.error('Error in newsletter route:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
