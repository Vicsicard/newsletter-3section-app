import { supabaseAdmin } from './supabase-admin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NewsletterSection {
  heading: string;
  body: string;
  image_prompt?: string;
  replicate_image_url: string | null;
  section_number: number;
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
        heading: prompt,
        body: completion.choices[0].message.content || 'No content generated',
        image_prompt: imagePrompt.choices[0].message.content || 'No image prompt generated',
        replicate_image_url: null,
        section_number: sections.length + 1
      });
    }

    // Update newsletter with generated content
    const { error: updateError } = await supabaseAdmin
      .from('newsletters')
      .update({
        industry_summary: industrySummary.choices[0].message.content || 'No industry summary generated',
        status: 'generated',
        updated_at: new Date().toISOString()
      })
      .eq('id', newsletterId);

    if (updateError) {
      console.error('Failed to update newsletter:', updateError);
      return { success: false, error: `Failed to update newsletter: ${updateError.message}` };
    }

    // Insert sections into newsletter_sections table
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const { error: sectionError } = await supabaseAdmin
        .from('newsletter_sections')
        .insert({
          newsletter_id: newsletterId,
          section_number: section.section_number,
          heading: section.heading,
          body: section.body,
          image_prompt: section.image_prompt,
          image_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (sectionError) {
        console.error(`Failed to insert section ${i + 1}:`, sectionError);
        return { success: false, error: `Failed to insert section ${i + 1}: ${sectionError.message}` };
      }
    }

    // Trigger email sending
    try {
      const baseUrl = process.env.BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const emailResponse = await fetch(`${baseUrl}/api/newsletter/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletterId })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Failed to trigger email:', errorText);
      } else {
        console.log('Email trigger response:', await emailResponse.json());
      }
    } catch (error) {
      console.error('Failed to trigger email sending:', error);
    }

    return {
      success: true,
      data: {
        newsletterId,
        sections: sections.length
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
    const parsed = JSON.parse(sectionJson);
    // Ensure the section has both imagePrompt and imageUrl
    return {
      ...parsed,
      replicate_image_url: parsed.replicate_image_url || parsed.imageUrl || null, // Try both possible image URL fields
      image_prompt: parsed.image_prompt || ''
    };
  } catch (error) {
    console.error('Failed to parse newsletter section:', error);
    return {
      heading: 'Error',
      body: 'Failed to load section content',
      image_prompt: '',
      replicate_image_url: null,
      section_number: 0
    };
  }
}
