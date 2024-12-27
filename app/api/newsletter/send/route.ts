import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { sendEmail, EmailResponse } from '@/utils/email';
import { generateEmailHTML, generatePlainText } from '@/utils/email-template';
import { parseNewsletterSection } from '@/utils/newsletter';

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
          contacts (
            email
          )
        )
      `)
      .eq('id', newsletterId)
      .single();

    if (newsletterError) {
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }

    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    // Parse newsletter sections
    const section1 = parseNewsletterSection(newsletter.section1_content);
    const section2 = parseNewsletterSection(newsletter.section2_content);
    const section3 = parseNewsletterSection(newsletter.section3_content);

    const sections = [section1, section2, section3].filter(Boolean);

    // Generate HTML and plain text versions
    const htmlContent = generateEmailHTML(
      newsletter.companies.company_name,
      newsletter.industry_summary,
      sections
    );

    const textContent = generatePlainText(
      newsletter.companies.company_name,
      newsletter.industry_summary,
      sections
    );

    // Send to all contacts
    const contacts = newsletter.newsletter_contacts.map(nc => nc.contacts).filter(Boolean);
    const emailPromises = contacts.map(async (contact: { email: string }) => {
      return sendEmail(
        contact.email,
        `${newsletter.companies.company_name} - Industry Newsletter`,
        htmlContent
      );
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);

    // Check if any emails failed to send
    const failedEmails = results.filter((result: EmailResponse) => !result.success);

    // Update newsletter status
    await supabaseAdmin
      .from('newsletters')
      .update({
        sent_at: new Date().toISOString(),
        sent_count: results.length - failedEmails.length,
        failed_count: failedEmails.length,
        last_sent_status: failedEmails.length === 0 ? 'success' : 'partial_failure'
      })
      .eq('id', newsletterId);

    return Response.json({
      success: true,
      totalSent: results.length - failedEmails.length,
      failedCount: failedEmails.length,
      status: failedEmails.length === 0 ? 'success' : 'partial_failure'
    });

  } catch (error) {
    console.error('Newsletter sending error:', error);
    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send newsletter',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
