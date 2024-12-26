import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsletterSection {
  title: string;
  content: string;
  image_url?: string;
}

interface NewsletterContent {
  title: string;
  sections: NewsletterSection[];
  industry_summary: string;
}

interface NewsletterParams {
  companyName: string;
  industry: string;
  targetAudience: string;
  audienceDescription: string;  // Changed from companyDescription to match DB field
}

async function generateImage(prompt: string): Promise<string> {
  const image = await openai.images.generate({
    prompt,
    size: "1024x1024",
    n: 1
  });

  if (!image.data[0]?.url) {
    throw new Error('Failed to generate image');
  }

  return image.data[0].url;
}

async function generateIndustrySummary(industry: string): Promise<string> {
  const industrySummaryPrompt = `Write a brief, engaging summary of the ${industry} industry, focusing on current trends, challenges, and opportunities. Keep it concise and informative.`;
  const industrySummaryResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: industrySummaryPrompt }]
  });
  const industrySummary = industrySummaryResponse.choices[0]?.message?.content || '';

  return industrySummary;
}

export async function generateNewsletterContent(params: NewsletterParams): Promise<NewsletterContent> {
  const { companyName, industry, targetAudience, audienceDescription } = params;

  // Generate industry summary
  const industrySummary = await generateIndustrySummary(industry);

  // Generate sections
  const sections = [];
  const sectionTypes = ['Success Story', 'Industry Best Practices', 'Innovation Spotlight'];

  for (const type of sectionTypes) {
    const sectionPrompt = `Write a compelling ${type} section for a newsletter targeting ${targetAudience} in the ${industry} industry. The company ${companyName} wants to engage ${audienceDescription}. Keep it informative and engaging.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: sectionPrompt }]
    });
    const content = response.choices[0]?.message?.content || '';

    // Generate a unique image for this section
    const imagePrompt = `Create a professional, business-appropriate image for a ${type} section in a ${industry} industry newsletter. ${
      type === 'Success Story' ? 'Show success and achievement.' :
      type === 'Industry Best Practices' ? 'Illustrate professional best practices and excellence.' :
      'Showcase innovation and forward-thinking concepts.'
    }`;
    const imageUrl = await generateImage(imagePrompt);

    sections.push({
      title: type,
      content,
      image_url: imageUrl
    });
  }

  return {
    title: `${companyName} Industry Insights`,
    industry_summary: industrySummary,
    sections
  };
}
