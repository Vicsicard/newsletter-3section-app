'use client';

import { useState } from 'react';
import Image from 'next/image';
import { generateNewsletter, getNewsletterById, parseNewsletterSection } from '@/utils/newsletter';
import type { NewsletterSection } from '@/utils/newsletter';

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
  const [sendStatus, setSendStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await generateNewsletter(params.id);
      setNewsletter(content);
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

  const renderSection = (section: NewsletterSection, index: number) => (
    <div key={index} className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
      {section.imageUrl && (
        <div className="relative w-full h-64 mb-4">
          <Image
            src={section.imageUrl}
            alt={section.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="prose max-w-none">
        {section.content.split('\n').map((paragraph, i) => (
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
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
            {newsletter && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Industry Summary</h2>
              <div className="prose max-w-none">
                {newsletter.industry_summary.split('\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {newsletter.sections.map((section: NewsletterSection, index: number) => 
              renderSection(section, index)
            )}
          </div>
        )}

        {!newsletter && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Click &quot;Generate Content&quot; to create your newsletter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
