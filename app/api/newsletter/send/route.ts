import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { sendEmail } from '@/utils/email';
import { generateEmailHTML } from '@/utils/email-template';

interface NewsletterSection {
  section_number: number;
  heading: string;
  body: string;
  replicate_image_url: string | null;
}

interface Contact {
  id: string;
  email: string;
  status: string;
}

interface NewsletterContact {
  id: string;
  contacts: Contact;
}

interface Company {
  company_name: string;
  industry: string;
  contact_email: string;
}

interface NewsletterWithSections {
  id: string;
  newsletter_sections: NewsletterSection[];
  companies: Company;
  newsletter_contacts: NewsletterContact[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { newsletterId } = await req.json();

    // Get newsletter and company data
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .select(`
        *,
        companies (
          company_name,
          industry,
          contact_email
        ),
        newsletter_contacts (
          id,
          contacts (
            id,
            email,
            status
          )
        ),
        newsletter_sections (
          section_number,
          heading,
          body,
          replicate_image_url
        )
      `)
      .eq('id', newsletterId)
      .single<NewsletterWithSections>();

    if (newsletterError) {
      console.error('Newsletter fetch error:', newsletterError);
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }

    if (!newsletter) {
      console.error('Newsletter not found for ID:', newsletterId);
      throw new Error('Newsletter not found');
    }

    if (!newsletter.newsletter_contacts || newsletter.newsletter_contacts.length === 0) {
      console.error('No contacts found for newsletter:', newsletterId);
      throw new Error('No contacts found for this newsletter');
    }

    // Transform sections into the expected format
    const sections = newsletter.newsletter_sections
      .sort((a: NewsletterSection, b: NewsletterSection) => a.section_number - b.section_number);

    console.log('Processed sections:', sections.length, JSON.stringify(sections, null, 2));

    // Generate HTML content
    const emailHtml = generateEmailHTML(newsletter.companies.company_name, sections);

    // Send to each contact
    const results = await Promise.all(
      newsletter.newsletter_contacts.map(async (nc) => {
        const contact = nc.contacts;
        if (!contact || !contact.email || contact.status !== 'active') {
          console.log('Skipping inactive or invalid contact:', contact);
          return { success: false, error: 'Invalid or inactive contact', email: contact?.email };
        }

        try {
          console.log('Sending email to:', contact.email);
          return await sendEmail(
            contact.email,
            `${newsletter.companies.company_name} Newsletter`,
            emailHtml
          );
        } catch (error) {
          console.error('Error sending to:', contact.email, error);
          return { success: false, error: error instanceof Error ? error.message : 'Send failed', email: contact.email };
        }
      })
    );

    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log('Email sending complete:', {
      total: results.length,
      success: successCount,
      failed: failedCount
    });

    return NextResponse.json({
      success: true,
      totalSent: successCount,
      failedCount,
      results
    });

  } catch (error) {
    console.error('Error in send route:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send newsletter'
    }, { status: 500 });
  }
}
