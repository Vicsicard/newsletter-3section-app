import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNewsletter(newsletterId: string) {
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
          contact_email
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

    const sections: any[] = [];

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
          content: "You are an expert at creating prompts for DALL-E 3 to generate ultra-realistic photographic images. Create prompts that result in high-quality, photorealistic imagery that looks like it was taken with a professional camera. Focus on objects, environments, and abstract concepts. IMPORTANT RULES: 1) NEVER include people in the images 2) NEVER include any text or writing 3) Always maintain photographic realism - images should look like they were captured by a professional photographer 4) Use natural lighting and professional photography techniques in the descriptions."
        }, {
          role: "user",
          content: `Create a DALL-E 3 prompt for an ultra-realistic photograph that represents: "${title}" for a ${company.industry} company targeting ${company.target_audience || 'general audience'}.
            The image must be photorealistic like a professional photograph, without any people or text.
            Focus on objects, environments, or abstract concepts that symbolize the theme.
            Use professional photography terms (depth of field, lighting, composition).
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

    if (updateError) {
      console.error('Failed to update newsletter:', updateError);
      return { success: false, error: `Failed to update newsletter: ${updateError.message}` };
    }

    // Trigger email sending
    try {
      const emailResponse = await fetch('http://localhost:3000/api/newsletter/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email:', await emailResponse.text());
      } else {
        console.log('Email sending triggered successfully');
      }
    } catch (error) {
      console.error('Failed to trigger email sending:', error);
    }

    return { success: true, data: { industry_summary: industrySummary.choices[0].message.content, sections } };

  } catch (error) {
    console.error('Failed to generate newsletter:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate newsletter' 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { newsletterId } = await request.json();
    
    const result = await generateNewsletter(newsletterId);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    }, { status: 500 });
  }
}
