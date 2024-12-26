import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsletterContent {
  content: string;
  objectives?: string;
  cta?: string;
}

interface NewsletterParams {
  companyName: string;
  industry: string;
  targetAudience: string;
}

export async function generateNewsletterContent(params: NewsletterParams): Promise<NewsletterContent> {
  const { companyName, industry, targetAudience } = params;

  const prompt = `Create a newsletter for ${companyName}, a company in the ${industry} industry.
Their target audience is ${targetAudience}.

The newsletter should include:
1. A compelling headline
2. An engaging introduction
3. Main content with valuable insights
4. A clear call-to-action

Keep the tone professional but friendly. Focus on providing value to the readers.`;

  try {
    console.log('Generating newsletter content with OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional newsletter writer who creates engaging, valuable content for businesses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('Newsletter content generated successfully');

    return {
      content,
      objectives: 'Engage and inform target audience',
      cta: 'Contact us to learn more'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate newsletter content');
  }
}
