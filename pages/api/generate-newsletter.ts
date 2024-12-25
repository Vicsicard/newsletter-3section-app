import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabase';
import { generateIndustryInsights, generateNewsletterSections } from '@/utils/openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Get company information
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Generate industry insights
    const insightsText = await generateIndustryInsights(company.industry, company.company_name);
    
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
      throw new Error(`Failed to create newsletter: ${newsletterError.message}`);
    }

    // Generate newsletter sections
    const newsletterContent = await generateNewsletterSections(
      company.company_name,
      company.industry,
      insightsText,
      company.target_audience
    );

    // Store newsletter sections
    const sections = newsletterContent.sections.map((section: any, index: number) => ({
      newsletter_id: newsletter.id,
      section_number: index + 1,
      heading: section.heading,
      body: section.body,
      image_prompt: section.imagePrompt
    }));

    const { error: sectionsError } = await supabaseAdmin
      .from('newsletter_sections')
      .insert(sections);

    if (sectionsError) {
      throw new Error(`Failed to store newsletter sections: ${sectionsError.message}`);
    }

    res.status(200).json({
      success: true,
      data: {
        newsletter_id: newsletter.id,
        industry_insights: industryInsight,
        sections: sections
      }
    });

  } catch (error: any) {
    console.error('Newsletter generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
