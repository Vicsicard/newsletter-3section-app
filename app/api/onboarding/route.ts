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
    let totalContacts = 0;

    if (contactListFile && contactListFile.size > 0) {
      console.log('Processing contact list file...');
      const fileContent = await contactListFile.text();
      const contacts = await parseCSV(fileContent);
      
      if (!company?.id) {
        console.error('Company ID is missing');
        throw new DatabaseError('Failed to process contacts: Company ID is missing');
      }

      // Add company_id to each contact
      const contactsWithCompanyId = contacts.map(contact => ({
        ...contact,
        company_id: company.id,
      }));

      // Insert contacts in batches
      if (contactsWithCompanyId.length > 0) {
        console.log(`Inserting ${contactsWithCompanyId.length} contacts...`);
        console.log('First contact:', contactsWithCompanyId[0]); // Debug log
        
        const { error: contactsError } = await supabaseAdmin
          .from('contacts')
          .insert(contactsWithCompanyId);

        if (contactsError) {
          console.error('Contacts insertion error:', contactsError);
          throw new DatabaseError(`Failed to insert contacts: ${contactsError.message}`);
        }
        console.log('Contacts inserted successfully');
        totalContacts = contactsWithCompanyId.length;
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
        total_contacts: totalContacts,
        failed_contacts: 0,
        status: 'success'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Detailed error in onboarding process:', {
      error,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    const apiError = error instanceof ApiError ? error : new DatabaseError('Internal server error');
    
    return NextResponse.json(
      {
        success: false,
        message: apiError.message,
        error: {
          type: apiError.name,
          details: error instanceof Error ? error.message : String(error)
        }
      },
      { status: apiError.statusCode || 500 }
    );
  }
}
