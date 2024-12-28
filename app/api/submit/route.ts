import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { generateIndustryInsights } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Form data received:', data);

    try {
      // First, test Supabase connection
      const { data: testData, error: testError } = await supabaseAdmin
        .from('companies')
        .select('count(*)')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error('Database connection failed');
      }

      console.log('Supabase connection successful');

      // Try to insert without OpenAI first
      const { data: company, error: supabaseError } = await supabaseAdmin
        .from('companies')
        .insert([{
          company_name: data.company_name,
          website_url: data.website_url,
          target_audience: data.target_audience,
          audience_description: data.audience_description,
          newsletter_objectives: data.newsletter_objectives,
          primary_cta: data.primary_cta,
          contact_email: data.contact_email,
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase insert error:', supabaseError);
        throw supabaseError;
      }

      console.log('Company data inserted successfully:', company);

      return NextResponse.json({
        success: true,
        data: {
          company_id: company.id
        }
      });
    } catch (innerError) {
      console.error('Inner error details:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
      details: error
    }, {
      status: 500
    });
  }
}
