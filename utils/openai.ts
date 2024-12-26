import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateIndustryInsights(industry: string, companyName: string) {
  try {
    const prompt = `You are a domain expert in ${industry}. 
Please provide a concise summary of up to 3 current trends, statistics, or insights 
that are relevant to a company named ${companyName}.
Return the answer in bullet form.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content generated');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating industry insights:', error);
    throw new Error('Failed to generate industry insights');
  }
}

export async function generateNewsletterSections(
  companyName: string,
  industry: string,
  industryInsights: string,
  targetAudience: string
) {
  try {
    const prompt = `You are a newsletter generator. Using the following data:

1. Company Information:
   - Company Name: ${companyName}
   - Industry: ${industry}
   - Target Audience: ${targetAudience}

2. Industry Info:
${industryInsights}

Generate a 3-section newsletter.
- Each section should have a heading and a short paragraph (3-4 sentences).
- Make it relevant to ${companyName}.
- Make sure to incorporate references to the ${industry} trends (provided above).
- After each section's text, include an 'imagePrompt' line describing the ideal visual for this section (for AI image generation).
- Return the entire answer in JSON format exactly like:
{
  "sections": [
    {
      "heading": "...",
      "body": "...",
      "imagePrompt": "..."
    },
    {
      "heading": "...",
      "body": "...",
      "imagePrompt": "..."
    },
    {
      "heading": "...",
      "body": "...",
      "imagePrompt": "..."
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content generated');
    }

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      throw new Error('Invalid JSON response from GPT');
    }
  } catch (error) {
    console.error('Error generating newsletter sections:', error);
    throw new Error('Failed to generate newsletter sections');
  }
}
