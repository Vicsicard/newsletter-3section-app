import { NextResponse } from 'next/server';
import formidable from 'formidable';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import { generateNewsletterContent } from '@/utils/newsletter';
import fs from 'fs/promises';
import type { OnboardingResponse, Company } from '@/types/form';
import { ApiError, DatabaseError, ValidationError } from '@/utils/errors';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // Initialize response object
  let responseData = {
    success: false,
    message: '',
    company: null as any
  };

  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }

    // Check if companies table exists
    console.log('Checking companies table...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('Table check error:', {
        error: tableError,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      });
      throw new Error(`Failed to access companies table: ${tableError.message}`);
    }

    console.log('Companies table accessible');

    // Get form data
    const formData = await req.formData();
    
    // Extract company data from FormData
    const companyData = {
      company_name: formData.get('company_name') as string,
      website_url: formData.get('website_url') as string,
      contact_email: formData.get('contact_email') as string,
      phone_number: formData.get('phone_number') as string,
      industry: formData.get('industry') as string,
      target_audience: formData.get('target_audience') as string,
      audience_description: formData.get('audience_description') as string,
      newsletter_objectives: formData.get('newsletter_objectives') as string,
      primary_cta: formData.get('primary_cta') as string,
      contacts_count: 0,
      created_at: new Date().toISOString(),
    };

    // Insert company data
    console.log('Inserting company data...');
    const { data: company, error: insertError } = await supabaseAdmin
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (insertError) {
      console.error('Company insertion error:', insertError);
      throw new Error(`Failed to insert company data: ${insertError.message}`);
    }

    console.log('Company data inserted successfully');

    // Process contact list if provided
    const contactListFile = formData.get('contact_list') as File;
    let contacts = [];
    if (contactListFile) {
      const fileContent = await contactListFile.text();
      contacts = await parseCSV(fileContent);
      console.log(`Parsed ${contacts.length} contacts from CSV`);
    }

    // Generate newsletter content
    console.log('Generating newsletter content...');
    const newsletterContent = await generateNewsletterContent({
      companyName: companyData.company_name,
      industry: companyData.industry,
      targetAudience: companyData.target_audience,
      audienceDescription: companyData.audience_description || '',
    });

    // Insert newsletter data
    console.log('Inserting newsletter data...');
    const { error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .insert([{
        company_id: company.id,
        title: newsletterContent.title,
        status: 'draft',
        industry_summary: newsletterContent.industry_summary,
        sections: newsletterContent.sections,
        created_at: new Date().toISOString(),
      }]);

    if (newsletterError) {
      console.error('Newsletter insertion error:', newsletterError);
      throw new Error(`Failed to insert newsletter data: ${newsletterError.message}`);
    }

    console.log('Newsletter data inserted successfully');

    // Set success response
    responseData = {
      success: true,
      message: 'Company and newsletter created successfully',
      company: company
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in onboarding process:', error);
    const apiError = error instanceof ApiError ? error : new DatabaseError('Internal server error');
    return NextResponse.json(
      {
        success: false,
        message: apiError.message
      },
      { status: apiError.statusCode }
    );
  }
}

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin.from('companies').select('count').limit(0);
    return !error;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}
