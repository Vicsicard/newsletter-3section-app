import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { DatabaseError } from '@/utils/errors';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

interface Section {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

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
          target_audience,
          audience_description,
          contact_email
        )
      `)
      .eq('id', newsletterId)
      .single();

    if (newsletterError) throw new DatabaseError(`Failed to fetch newsletter: ${newsletterError.message}`);
    if (!newsletter) throw new Error('Newsletter not found');
    if (!newsletter.companies) throw new Error('Company data not found');

    const company = newsletter.companies;

    // Generate industry summary
    const industrySummary = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a professional newsletter writer specializing in business content."
      }, {
        role: "user",
        content: `Write a brief summary about the ${company.industry} industry, focusing on trends and opportunities 
        relevant to ${company.target_audience || 'general audience'}. Context: ${company.audience_description || 'Business professionals'}`
      }]
    });

    // Generate three distinct sections
    const sectionPrompts = [
      "Write about current industry trends and innovations",
      "Provide practical tips and best practices",
      "Share success stories or case studies"
    ];

    const sections: Section[] = [];

    for (const prompt of sectionPrompts) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a professional newsletter writer specializing in business content."
        }, {
          role: "user",
          content: `${prompt} for ${company.company_name}, a ${company.industry} company targeting ${company.target_audience || 'general audience'}. 
          Make it engaging and actionable. Include a title for this section.`
        }]
      });

      const content = completion.choices[0].message.content || '';
      const [title, ...contentParts] = content.split('\n').filter(Boolean);

      // Generate image prompt
      const imagePromptCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are an expert at creating prompts for DALL-E 3 to generate professional business images. Create prompts that are specific, detailed, and result in high-quality, photorealistic business imagery. Focus on professional settings, modern aesthetics, and business-appropriate scenes."
        }, {
          role: "user",
          content: `Create a DALL-E 3 prompt for a professional image that represents: "${title}" for a ${company.industry} company targeting ${company.target_audience || 'general audience'}.
          The image should be photorealistic, modern, and business-appropriate.
          Make it specific and detailed but keep it under 200 characters.`
        }]
      });

      const imagePrompt = imagePromptCompletion.choices[0].message.content || '';
      console.log('Generated image prompt:', imagePrompt);

      try {
        const imageResponse = await openai.images.generate({
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
        });

        console.log('Image generation response:', imageResponse);

        sections.push({
          title: title.replace(/^#+ /, ''), // Remove Markdown headers if present
          content: contentParts.join('\n'),
          imagePrompt,
          imageUrl: imageResponse.data[0]?.url
        });
      } catch (imageError) {
        console.error('Image generation error:', imageError);
        sections.push({
          title: title.replace(/^#+ /, ''),
          content: contentParts.join('\n'),
          imagePrompt,
          imageUrl: undefined
        });
      }
    }

    // Update newsletter with generated content
    const { error: updateError } = await supabaseAdmin
      .from('newsletters')
      .update({
        industry_summary: industrySummary.choices[0].message.content,
        section1_content: JSON.stringify(sections[0]),
        section2_content: JSON.stringify(sections[1]),
        section3_content: JSON.stringify(sections[2]),
        updated_at: new Date().toISOString()
      })
      .eq('id', newsletterId);

    if (updateError) throw new DatabaseError(`Failed to update newsletter: ${updateError.message}`);

    return Response.json({
      success: true,
      message: 'Newsletter content generated successfully',
      data: {
        industry_summary: industrySummary.choices[0].message.content,
        sections
      }
    });

  } catch (error) {
    console.error('Newsletter generation error:', error);
    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate newsletter content',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
