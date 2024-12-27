import OpenAI from 'openai';
import { NewsletterSection } from './newsletter';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateIndustryInsights(industry: string, companyName: string) {
  try {
    const prompt = `Provide 5-7 key industry insights and trends for the ${industry} industry 
that are relevant to a company named ${companyName}.
Return the answer in bullet form.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating industry insights:', error);
    throw error;
  }
}

export async function generateNewsletterSections(
  companyName: string,
  industry: string,
  industryInsights: string,
  targetAudience: string,
  websiteUrl: string,
  newsletterObjectives: string
): Promise<NewsletterSection[]> {
  const prompt = `You are a professional content creator specializing in crafting engaging, polished newsletters for businesses. Your goal is to create a high-quality, industry-specific newsletter broken into three standalone bundles. Each bundle should correspond to one section of the newsletter (Pain Point Analysis, Common Mistakes, and Company Solutions), ready for individual use in downstream processes. Use the Industry Insights to help craft the sections.

Company Information:
Company Name: ${companyName}
Website URL: ${websiteUrl}
Newsletter Objectives: ${newsletterObjectives}
Industry: ${industry}
Target Audience: ${targetAudience}
Industry Insights: ${industryInsights}

Newsletter Theme:
A polished newsletter with three sections: (1) addressing a critical pain point, (2) identifying common mistakes, and (3) presenting the company's solution and its benefits.

Please generate three sections following this exact format for each:

Bundle 1: Pain Point Analysis
Headline: [Dynamic headline based on the industry]
Introduction: [One paragraph outlining a critical pain point specific to industry]
Why It Matters:
- [Bullet point 1: Tailored to industry]
- [Bullet point 2: Tailored to industry]
- [Bullet point 3: Tailored to industry]
The Solution:
[How the company addresses the pain point]
The Takeaway:
[Strong summary with a call to action]
Image Prompt: [Description of the visual theme for this section]

Bundle 2: Common Mistakes
Headline: [Dynamic headline based on common mistakes in industry]
Introduction: [One paragraph introducing common mistakes specific to industry]
Mistakes to Avoid:
- [Mistake 1: Tailored to industry]
- [Mistake 2: Tailored to industry]
- [Mistake 3: Tailored to industry]
How ${companyName} Helps:
[Specific ways the company assists clients]
The Takeaway:
[Encouraging summary and CTA]
Image Prompt: [Description of the visual theme for this section]

Bundle 3: Company Solutions
Headline: [Dynamic headline based on the company's solutions]
Introduction: [One paragraph introducing the company's solutions]
How ${companyName} Helps:
- [Solution 1: Tailored to industry]
- [Solution 2: Tailored to industry]
- [Solution 3: Tailored to industry]
Why It's a Game-Changer:
[Explanation of the transformative impact of the solution]
The Takeaway:
[Encourage the reader to take the next step]
Image Prompt: [Description of the visual theme for this section]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a professional newsletter content creator. Format your response exactly as requested in the prompt, maintaining proper structure and formatting."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response into three sections
    const sections = response.split('Bundle').filter(section => section.trim());
    
    return sections.map(section => {
      const lines = section.split('\n').filter(line => line.trim());
      const title = lines.find(line => line.includes('Headline:'))?.split('Headline:')[1]?.trim() || '';
      const imagePrompt = lines.find(line => line.includes('Image Prompt:'))?.split('Image Prompt:')[1]?.trim() || '';
      
      // Remove the section number, headline, and image prompt lines to get the content
      const content = lines
        .filter(line => !line.includes('Bundle') && !line.includes('Headline:') && !line.includes('Image Prompt:'))
        .join('\n')
        .trim();

      return {
        title,
        content,
        imagePrompt,
      };
    });
  } catch (error) {
    console.error('Error generating newsletter sections:', error);
    throw error;
  }
}
