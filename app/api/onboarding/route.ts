import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Data received:', data);

    // First, insert company data
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([{
        company_name: data.company_name,
        website_url: data.website_url || null,
        target_audience: data.target_audience,
        audience_description: data.audience_description || null,
        contact_email: data.contact_email,
        industry: data.industry,
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
        title: `${data.company_name}'s Newsletter`,
        newsletter_objectives: data.newsletter_objectives || null,
        primary_cta: data.primary_cta || null,
        status: 'draft',
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

    // Trigger the newsletter generation
    try {
      const generateResponse = await fetch('http://localhost:3000/api/newsletter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId: newsletter.id
        })
      });

      if (!generateResponse.ok) {
        console.error('Newsletter generation failed:', await generateResponse.text());
      }
    } catch (error) {
      console.error('Failed to trigger newsletter generation:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        company_id: company.id,
        newsletter_id: newsletter.id,
        message: 'Newsletter generation started'
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
