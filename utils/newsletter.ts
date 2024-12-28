import { supabaseAdmin } from './supabase-admin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NewsletterSection {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface NewsletterContent {
  industry_summary: string;
  sections: NewsletterSection[];
}

export async function generateNewsletterContent(newsletterId: string) {
  try {
    // Get newsletter with company data
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .select(`
        *,
        companies (
          company_name,
          industry,
          target_audience,
          audience_description,
          website_url,
          newsletter_objectives,
          primary_cta
        )
      `)
      .eq('id', newsletterId)
      .single();

    if (newsletterError) {
      console.error('Failed to fetch newsletter:', newsletterError);
      return { success: false, error: `Failed to fetch newsletter: ${newsletterError.message}` };
    }

    if (!newsletter || !newsletter.companies) {
      console.error('Newsletter or company data not found');
      return { success: false, error: 'Newsletter or company data not found' };
    }

    const company = newsletter.companies;

    // Generate industry summary
    const industrySummary = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable business consultant. Provide a brief, insightful summary of recent trends and developments in the specified industry."
        },
        {
          role: "user",
          content: `Provide a brief summary of current trends and developments in the ${company.industry} industry, focusing on aspects relevant to ${company.target_audience}.`
        }
      ]
    });

    // Section prompts
    const sectionPrompts = [
      "Highlight industry trends and innovations",
      "Provide actionable insights and tips",
      "Share success stories or case studies"
    ];

    const sections: NewsletterSection[] = [];

    for (const prompt of sectionPrompts) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `You are writing a section for a newsletter for ${company.company_name}, a company in the ${company.industry} industry. 
            Their target audience is ${company.target_audience}.
            ${company.audience_description ? `Additional audience details: ${company.audience_description}` : ''}
            ${company.newsletter_objectives ? `Newsletter objectives: ${company.newsletter_objectives}` : ''}
            ${company.primary_cta ? `Primary call-to-action: ${company.primary_cta}` : ''}`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const imagePrompt = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: "Generate a clear, specific prompt for DALL-E to create a relevant business-appropriate image for this newsletter section."
          },
          {
            role: "user",
            content: `Create an image prompt for a section about: ${completion.choices[0].message.content}`
          }
        ]
      });

      sections.push({
        title: prompt,
        content: completion.choices[0].message.content,
        imagePrompt: imagePrompt.choices[0].message.content,
      });
    }

    // Update newsletter with generated content
    const { error: updateError } = await supabaseAdmin
      .from('newsletters')
      .update({
        industry_summary: industrySummary.choices[0].message.content,
        section1_content: JSON.stringify(sections[0]),
        section2_content: JSON.stringify(sections[1]),
        section3_content: JSON.stringify(sections[2]),
        status: 'generated',
        updated_at: new Date().toISOString()
      })
      .eq('id', newsletterId);

    if (updateError) {
      console.error('Failed to update newsletter:', updateError);
      return { success: false, error: `Failed to update newsletter: ${updateError.message}` };
    }

    // Trigger email sending
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletterId })
      });

      if (!emailResponse.ok) {
        console.error('Failed to trigger email:', await emailResponse.text());
      }
    } catch (error) {
      console.error('Failed to trigger email sending:', error);
    }

    return { 
      success: true, 
      data: { 
        industry_summary: industrySummary.choices[0].message.content, 
        sections 
      } 
    };

  } catch (error) {
    console.error('Failed to generate newsletter:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate newsletter' 
    };
  }
}

export async function getNewsletterById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export function parseNewsletterSection(sectionJson: string): NewsletterSection {
  try {
    return JSON.parse(sectionJson);
  } catch (error) {
    console.error('Failed to parse newsletter section:', error);
    return {
      title: 'Error',
      content: 'Failed to load section content',
      imagePrompt: '',
      imageUrl: ''
    };
  }
}
