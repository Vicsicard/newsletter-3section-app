import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabase';
import { generateIndustryInsights, generateNewsletterSections } from '@/utils/openai';

if (!process.env.BREVO_API_KEY) {
  throw new Error('Missing BREVO_API_KEY environment variable');
}

if (!process.env.BREVO_SENDER_EMAIL) {
  throw new Error('Missing BREVO_SENDER_EMAIL environment variable');
}

// Initialize Brevo API client
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { companyId } = req.body;
    console.log('Generating newsletter for company:', companyId);

    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Company ID is required' });
    }

    // Get company information
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return res.status(500).json({ success: false, error: `Failed to fetch company: ${companyError.message}` });
    }

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    console.log('Generating industry insights for:', company.industry);
    
    // Generate industry insights
    const insightsText = await generateIndustryInsights(company.industry, company.company_name);
    if (!insightsText) {
      throw new Error('Failed to generate industry insights');
    }
    
    console.log('Generated insights:', insightsText);

    // Store industry insights
    const { data: industryInsight, error: insightError } = await supabaseAdmin
      .from('industry_insights')
      .insert([
        {
          company_id: companyId,
          industry: company.industry,
          insights: { bullets: insightsText.split('\n').filter(Boolean) }
        }
      ])
      .select()
      .single();

    if (insightError) {
      console.error('Error storing industry insights:', insightError);
      throw new Error(`Failed to store industry insights: ${insightError.message}`);
    }

    // Create newsletter record
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .insert([
        {
          company_id: companyId,
          industry_insight_id: industryInsight.id,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (newsletterError) {
      console.error('Error creating newsletter:', newsletterError);
      throw new Error(`Failed to create newsletter: ${newsletterError.message}`);
    }

    console.log('Generating newsletter sections');

    // Generate newsletter sections
    const newsletterContent = await generateNewsletterSections(
      company.company_name,
      company.industry,
      insightsText,
      company.target_audience
    );

    if (!newsletterContent?.sections || !Array.isArray(newsletterContent.sections)) {
      console.error('Invalid newsletter content:', newsletterContent);
      throw new Error('Failed to generate valid newsletter sections');
    }

    console.log('Generated sections:', newsletterContent.sections);

    // Store newsletter sections
    interface NewsletterSection {
      newsletter_id: string;
      section_number: number;
      heading: string;
      body: string;
      image_prompt: string;
    }

    const sections: NewsletterSection[] = newsletterContent.sections.map((section: any, index: number) => {
      if (!section.heading || !section.body || !section.imagePrompt) {
        console.error('Invalid section:', section);
        throw new Error(`Section ${index + 1} is missing required fields`);
      }
      return {
        newsletter_id: newsletter.id,
        section_number: index + 1,
        heading: section.heading,
        body: section.body,
        image_prompt: section.imagePrompt
      };
    });

    const { error: sectionsError } = await supabaseAdmin
      .from('newsletter_sections')
      .insert(sections);

    if (sectionsError) {
      console.error('Error storing newsletter sections:', sectionsError);
      throw new Error(`Failed to store newsletter sections: ${sectionsError.message}`);
    }

    // Generate HTML content with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .newsletter-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .newsletter-section {
              margin-bottom: 30px;
            }
            h1 {
              color: #2563eb;
              font-size: 24px;
              margin-bottom: 20px;
            }
            h2 {
              color: #1d4ed8;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .divider {
              border-top: 1px solid #e5e7eb;
              margin: 25px 0;
            }
          </style>
        </head>
        <body>
          <div class="newsletter-header">
            <h1>${company.company_name} Newsletter</h1>
          </div>
          ${sections.map((section: NewsletterSection) => `
            <div class="newsletter-section">
              <h2>${section.heading}</h2>
              <div>${section.body}</div>
            </div>
            <div class="divider"></div>
          `).join('')}
        </body>
      </html>
    `;

    try {
      console.log('Updating newsletter sections...');
      const { error: contentError } = await supabaseAdmin
        .from('newsletter_sections')
        .update({ 
          body: htmlContent
        })
        .eq('newsletter_id', newsletter.id)
        .eq('section_number', 1); // Store in first section

      if (contentError) {
        console.error('Error updating newsletter content:', contentError);
        throw new Error(`Failed to update newsletter content: ${contentError.message}`);
      }

      console.log('Successfully updated newsletter sections');

      // Update newsletter status
      console.log('Updating newsletter status...');
      const { error: statusError } = await supabaseAdmin
        .from('newsletters')
        .update({ 
          status: 'published'
        })
        .eq('id', newsletter.id);

      if (statusError) {
        console.error('Error updating newsletter status:', statusError);
        throw new Error(`Failed to update newsletter status: ${statusError.message}`);
      }

      console.log('Successfully updated newsletter status');

      // Send newsletter via Brevo API
      try {
        console.log('Sending newsletter via Brevo...');
        const headers = new Headers({
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY || '',
          'content-type': 'application/json',
        });

        const response = await fetch(BREVO_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: [{ email: company.contact_email }],
            sender: { 
              email: process.env.BREVO_SENDER_EMAIL,
              name: process.env.BREVO_SENDER_NAME || 'Newsletter Generator'
            },
            subject: `Your ${company.company_name} Newsletter is Ready`,
            htmlContent: htmlContent,
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Brevo API error:', error);
          throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
        }

        console.log('Newsletter sent successfully');
      } catch (emailError: any) {
        console.error('Error sending email:', emailError);
        throw new Error(`Failed to send newsletter email: ${emailError.message}`);
      }

      res.status(200).json({
        success: true,
        message: `Newsletter has been generated and sent to ${company.contact_email}`,
        data: {
          newsletter_id: newsletter.id,
          industry_insights: industryInsight,
          sections: sections
        }
      });
    } catch (error: any) {
      console.error('Error in final steps:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error: any) {
    console.error('Newsletter generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
}
