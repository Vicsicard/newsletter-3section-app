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

interface NewsletterData {
  id: string;
  industry_summary: string;
  companies: {
    company_name: string;
    industry: string;
    contact_email: string;
  };
  newsletter_sections: NewsletterSection[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('Email route called');
  try {
    const { newsletterId } = await req.json();
    console.log('Newsletter ID:', newsletterId);

    // Get newsletter with company data and sections
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .select(`
        *,
        companies (
          company_name,
          industry,
          contact_email
        ),
        newsletter_sections (
          section_number,
          heading,
          body,
          replicate_image_url
        )
      `)
      .eq('id', newsletterId)
      .single<NewsletterData>();

    if (newsletterError) {
      console.error('Database error:', newsletterError);
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }
    if (!newsletter) {
      console.error('Newsletter not found');
      throw new Error('Newsletter not found');
    }
    if (!newsletter.companies) {
      console.error('Company data not found');
      throw new Error('Company data not found');
    }

    console.log('Newsletter data retrieved:', {
      id: newsletter.id,
      company: newsletter.companies.company_name,
      email: newsletter.companies.contact_email,
      sectionsCount: newsletter.newsletter_sections?.length
    });

    // Check if we have all sections
    if (!newsletter.newsletter_sections || newsletter.newsletter_sections.length !== 3) {
      console.error('Missing sections:', { 
        sectionsFound: newsletter.newsletter_sections?.length,
        expected: 3 
      });
      throw new Error('Newsletter content not fully generated yet');
    }

    // Sort sections by section_number
    const sections = newsletter.newsletter_sections
      .sort((a: NewsletterSection, b: NewsletterSection) => a.section_number - b.section_number);

    console.log('Newsletter sections processed:', sections.length);

    // Generate HTML content
    const emailHtml = generateEmailHTML(newsletter.companies.company_name, sections);

    // Send the email
    const emailResponse = await sendEmail(
      newsletter.companies.contact_email,
      `${newsletter.companies.company_name} Newsletter Draft`,
      emailHtml
    );

    if (!emailResponse.success) {
      console.error('Failed to send email:', emailResponse.error);
      throw new Error(`Failed to send email: ${
        typeof emailResponse.error === 'string' 
          ? emailResponse.error 
          : emailResponse.error.message
      }`);
    }

    console.log('Email sent successfully:', {
      to: newsletter.companies.contact_email,
      messageId: emailResponse.messageId
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: emailResponse.messageId
    });

  } catch (error) {
    console.error('Error in email route:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}
