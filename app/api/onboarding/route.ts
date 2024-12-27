import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import { generateNewsletterContent } from '@/utils/newsletter';
import type { OnboardingResponse, Company } from '@/types';
import { ApiError, DatabaseError } from '@/utils/errors';
import { NextRequest } from 'next/server';

// New way to configure API routes in App Router
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get form data
    const formData = await req.formData();
    
    // Extract company data from FormData - including the new fields
    const companyData = {
      company_name: formData.get('company_name') as string,
      industry: formData.get('industry') as string,
      contact_email: formData.get('contact_email') as string,
      website_url: formData.get('website_url') as string,
      phone_number: formData.get('phone_number') as string,
      target_audience: formData.get('target_audience') as string || 'General Audience',
      audience_description: formData.get('audience_description') as string,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store newsletter-specific metadata
    const newsletterMetadata = {
      newsletter_objectives: formData.get('newsletter_objectives') as string,
      primary_cta: formData.get('primary_cta') as string,
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
      throw new DatabaseError(`Failed to insert company data: ${insertError.message}`);
    }

    console.log('Company data inserted successfully');

    // Process contact list if provided
    const contactListFile = formData.get('contact_list') as File;
    let contacts = [];
    if (contactListFile) {
      const fileContent = await contactListFile.text();
      contacts = await parseCSV(fileContent);
      
      // Add company_id to each contact
      contacts = contacts.map(contact => ({
        ...contact,
        company_id: company.id,
      }));

      // Insert contacts in batches
      if (contacts.length > 0) {
        const { error: contactsError } = await supabaseAdmin
          .from('contacts')
          .insert(contacts);

        if (contactsError) {
          console.error('Contacts insertion error:', contactsError);
          throw new DatabaseError(`Failed to insert contacts: ${contactsError.message}`);
        }
      }
    }

    // Generate newsletter content
    console.log('Generating newsletter content...');
    const newsletterContent = await generateNewsletterContent({
      companyName: companyData.company_name,
      industry: companyData.industry,
      targetAudience: companyData.target_audience,
      audienceDescription: companyData.audience_description,
      objectives: newsletterMetadata.newsletter_objectives,
      primaryCta: newsletterMetadata.primary_cta,
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
        updated_at: new Date().toISOString(),
      }]);

    if (newsletterError) {
      console.error('Newsletter insertion error:', newsletterError);
      throw new DatabaseError(`Failed to insert newsletter data: ${newsletterError.message}`);
    }

    console.log('Newsletter data inserted successfully');

    // Set success response
    const response: OnboardingResponse = {
      success: true,
      message: 'Company and newsletter created successfully',
      data: {
        company_id: company.id,
        total_contacts: contacts.length,
        failed_contacts: 0,
        status: 'success'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in onboarding process:', error);
    const apiError = error instanceof ApiError ? error : new DatabaseError('Internal server error');
    return NextResponse.json(
      {
        success: false,
        message: apiError.message
      },
      { status: apiError.statusCode || 500 }
    );
  }
}
