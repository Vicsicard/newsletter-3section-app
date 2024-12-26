import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabase';
import { generateIndustryInsights, generateNewsletterSections } from '@/utils/openai';
import { sendEmail } from '@/utils/email';

if (!process.env.BREVO_API_KEY) {
  throw new Error('Missing BREVO_API_KEY environment variable');
}

if (!process.env.BREVO_SENDER_EMAIL) {
  throw new Error('Missing BREVO_SENDER_EMAIL environment variable');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed', error: 'Method not allowed' });
  }

  try {
    const { companyId } = req.body;
    console.log('Generating newsletter for company:', companyId);

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required', error: 'Company ID is required' });
    }

    // Get company information
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      return res.status(500).json({ success: false, message: `Failed to fetch company: ${companyError.message}`, error: `Failed to fetch company: ${companyError.message}` });
    }

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found', error: 'Company not found' });
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

    if (!newsletterContent) {
      throw new Error('Failed to generate newsletter sections');
    }

    // Update newsletter with content
    const { error: updateError } = await supabaseAdmin
      .from('newsletters')
      .update({ content: newsletterContent, status: 'published' })
      .eq('id', newsletter.id);

    if (updateError) {
      console.error('Error updating newsletter:', updateError);
      throw new Error(`Failed to update newsletter: ${updateError.message}`);
    }

    // Send email with newsletter
    try {
      await sendEmail(
        company.contact_email,
        `Your ${company.company_name} Newsletter Draft`,
        `
        <h1>Your Newsletter Draft is Ready!</h1>
        <p>We've generated a draft newsletter for ${company.company_name}. Click the link below to view and edit it:</p>
        <p><a href="${process.env.BASE_URL}/newsletter/${newsletter.id}">View Your Newsletter</a></p>
        <hr>
        ${newsletterContent}
        `
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't throw here, we still want to return success even if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Newsletter generated successfully',
      data: {
        newsletterId: newsletter.id,
        previewUrl: `/newsletter/${newsletter.id}`
      }
    });
  } catch (error) {
    console.error('Error in newsletter generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorMessage
    });
  }
}
