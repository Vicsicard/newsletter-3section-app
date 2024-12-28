import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { generateNewsletterContent } from '@/utils/newsletter';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Data received:', data);

    // Validate required fields
    if (!data.company_name || !data.contact_email || !data.industry) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: company_name, contact_email, and industry are required'
      }, { status: 400 });
    }

    // First, insert company data
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([{
        company_name: data.company_name,
        website_url: data.website_url || null,
        target_audience: data.target_audience || 'General Business Audience',
        audience_description: data.audience_description || null,
        contact_email: data.contact_email,
        industry: data.industry,
        newsletter_objectives: data.newsletter_objectives || null,
        primary_cta: data.primary_cta || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (companyError) {
      console.error('Company insert error:', companyError);
      return NextResponse.json({
        success: false,
        error: `Failed to save company data: ${companyError.message}`
      }, { status: 500 });
    }

    console.log('Company data inserted successfully:', company);

    // Create initial newsletter entry
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .insert([{
        company_id: company.id,
        status: 'generating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (newsletterError) {
      console.error('Newsletter insert error:', newsletterError);
      console.warn('Newsletter creation failed but company was created successfully');
      return NextResponse.json({
        success: false,
        error: `Failed to create newsletter: ${newsletterError.message}`
      }, { status: 500 });
    }

    // Generate the newsletter directly
    try {
      const generateResult = await generateNewsletterContent(newsletter.id);
      if (!generateResult.success) {
        console.error('Newsletter generation failed:', generateResult.error);
        
        // Update newsletter status to error
        const { error: updateError } = await supabaseAdmin
          .from('newsletters')
          .update({
            status: 'error',
            error_message: generateResult.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', newsletter.id);

        if (updateError) {
          console.error('Failed to update newsletter status:', updateError);
        }

        return NextResponse.json({
          success: false,
          error: generateResult.error,
          data: {
            company_id: company.id,
            newsletter_id: newsletter.id
          }
        }, { status: 500 });
      }

      // Update newsletter status to draft
      const { error: updateError } = await supabaseAdmin
        .from('newsletters')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', newsletter.id);

      if (updateError) {
        console.error('Failed to update newsletter status:', updateError);
      }

    } catch (error) {
      console.error('Failed to generate newsletter:', error);
      
      // Update newsletter status to error
      const { error: updateError } = await supabaseAdmin
        .from('newsletters')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', newsletter.id);

      if (updateError) {
        console.error('Failed to update newsletter status:', updateError);
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to generate newsletter content',
        data: {
          company_id: company.id,
          newsletter_id: newsletter.id
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        company_id: company.id,
        newsletter_id: newsletter.id,
        message: 'Newsletter generation completed'
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    }, { status: 500 });
  }
}
