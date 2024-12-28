'use client';

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Home() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    website_url: '',
    target_audience: '',
    audience_description: '',
    newsletter_objectives: '',
    primary_cta: '',
    contact_email: '',
    industry: ''
  });

  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF69B4', '#FFC67D', '#8BC34A', '#64B5F6', '#BA68C8']
    });

    // Second burst after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF69B4', '#FFC67D', '#8BC34A', '#64B5F6', '#BA68C8']
      });
    }, 250);

    // Third burst after another small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF69B4', '#FFC67D', '#8BC34A', '#64B5F6', '#BA68C8']
      });
    }, 400);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Show the success modal immediately
      setSubmittedEmail(formData.contact_email);
      dialogRef.current?.showModal();
      triggerConfetti();

      // Reset form
      setFormData({
        company_name: '',
        website_url: '',
        target_audience: '',
        audience_description: '',
        newsletter_objectives: '',
        primary_cta: '',
        contact_email: '',
        industry: ''
      });

      // Submit data in the background
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    dialogRef.current?.close();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Newsletter Setup</h1>
            
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Company Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
              
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Newsletter Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Newsletter Information</h2>
              
              <div>
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
                  Target Audience *
                </label>
                <input
                  type="text"
                  id="target_audience"
                  name="target_audience"
                  required
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="audience_description" className="block text-sm font-medium text-gray-700">
                  Audience Description
                </label>
                <textarea
                  id="audience_description"
                  name="audience_description"
                  rows={3}
                  value={formData.audience_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="newsletter_objectives" className="block text-sm font-medium text-gray-700">
                  Newsletter Objectives
                </label>
                <textarea
                  id="newsletter_objectives"
                  name="newsletter_objectives"
                  rows={3}
                  value={formData.newsletter_objectives}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="primary_cta" className="block text-sm font-medium text-gray-700">
                  Primary Call to Action
                </label>
                <input
                  type="text"
                  id="primary_cta"
                  name="primary_cta"
                  value={formData.primary_cta}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Newsletter'}
            </button>
          </div>
        </form>

        {/* Success Modal */}
        <dialog ref={dialogRef} className="p-8 rounded-lg shadow-lg backdrop:bg-black backdrop:bg-opacity-50">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-green-600">Success! 🎉</h2>
            <div className="text-center space-y-3">
              <p>
                Thank you for submitting your information. Your newsletter is being generated and will be sent to <span className="font-semibold">{submittedEmail}</span> within the next 30 minutes.
              </p>
              <p className="text-sm text-gray-600">
                Look for an email from <span className="font-semibold">Digital Rascal (info@digitalrascalmarketing.com)</span> with the subject: <span className="font-semibold">Newsletter Draft - {formData.company_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Please check your spam folder if you don't see it in your inbox.
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </dialog>
      </div>
    </main>
  );
}
