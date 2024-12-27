import { supabaseAdmin } from './supabase-admin';

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

export async function generateNewsletter(newsletterId: string): Promise<NewsletterContent> {
  const response = await fetch('/api/newsletter/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newsletterId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate newsletter');
  }

  const data = await response.json();
  return data.data;
}

export async function getNewsletterById(id: string) {
  const response = await fetch(`/api/newsletter/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch newsletter');
  }
  const data = await response.json();
  return data.data;
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
