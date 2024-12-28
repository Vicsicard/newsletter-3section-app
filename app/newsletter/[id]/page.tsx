'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateNewsletterContent } from '@/utils/newsletter';
import { supabase } from '@/utils/supabase-browser';

interface NewsletterSection {
  heading: string;
  body: string;
  replicate_image_url: string | null;
  section_number: number;
}

interface NewsletterPageProps {
  params: {
    id: string;
  };
}

export default function NewsletterPage({ params }: NewsletterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<any>(null);
  const [sections, setSections] = useState<NewsletterSection[]>([]);
  const [sendStatus, setSendStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Fetch newsletter data on mount
  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const { data: newsletter, error: newsletterError } = await supabase
          .from('newsletters')
          .select(`
            *,
            companies (
              company_name,
              industry
            ),
            newsletter_sections (
              section_number,
              heading,
              body,
              replicate_image_url
            )
          `)
          .eq('id', params.id)
          .single();

        if (newsletterError) throw newsletterError;
        if (!newsletter) throw new Error('Newsletter not found');

        setNewsletter(newsletter);
        if (newsletter.newsletter_sections) {
          setSections(
            newsletter.newsletter_sections
              .sort((a: NewsletterSection, b: NewsletterSection) => a.section_number - b.section_number)
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch newsletter');
      }
    };

    fetchNewsletter();
  }, [params.id]);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await generateNewsletterContent(params.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Fetch updated newsletter data
      const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .select(`
          *,
          companies (
            company_name,
            industry
          ),
          newsletter_sections (
            section_number,
            heading,
            body,
            replicate_image_url
          )
        `)
        .eq('id', params.id)
        .single();

      if (newsletterError) throw newsletterError;
      if (!newsletter) throw new Error('Newsletter not found');

      setNewsletter(newsletter);
      if (newsletter.newsletter_sections) {
        setSections(
          newsletter.newsletter_sections
            .sort((a: NewsletterSection, b: NewsletterSection) => a.section_number - b.section_number)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      setSendStatus(null);
      setError(null);

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletterId: params.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send newsletter');
      }

      setSendStatus({
        success: true,
        message: `Newsletter sent successfully to ${data.totalSent} contacts${
          data.failedCount ? ` (${data.failedCount} failed)` : ''
        }`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send newsletter');
      setSendStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send newsletter'
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderSection = (section: NewsletterSection) => (
    <div key={section.section_number} className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
      {section.replicate_image_url && (
        <div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '1rem' }}>
          <Image
            src={section.replicate_image_url}
            alt={section.heading}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-lg"
            priority
          />
        </div>
      )}
      <div className="prose max-w-none">
        {section.body.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Newsletter Preview</h1>
          <div className="space-x-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
            {newsletter && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Newsletter'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {sendStatus && (
          <div className={`mb-8 p-4 rounded-lg ${
            sendStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {sendStatus.message}
          </div>
        )}

        {newsletter && (
          <div>
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md text-center">
              <h1 className="text-4xl font-bold mb-2">{newsletter.companies.company_name}</h1>
              <p className="text-gray-600">Your Industry Newsletter</p>
            </div>

            {sections.map((section) => renderSection(section))}
          </div>
        )}
      </div>
    </div>
  );
}
