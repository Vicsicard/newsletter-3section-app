import { useState, FormEvent } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import type { FormErrors } from '@/types';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    
    // Company name validation
    if (!formData.get('company_name')?.toString().trim()) {
      errors.company_name = 'Company name is required';
    }

    // Website URL validation
    const websiteUrl = formData.get('website_url')?.toString().trim();
    if (websiteUrl && !websiteUrl.match(/^https?:\/\/.*\..+$/)) {
      errors.website_url = 'Please enter a valid URL starting with http:// or https://';
    }

    // Email validation
    const email = formData.get('contact_email')?.toString().trim();
    if (!email) {
      errors.contact_email = 'Email is required';
    } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.contact_email = 'Please enter a valid email address';
    }

    // CSV file validation
    const csvFile = formData.get('csv_file') as File | null;
    if (!csvFile) {
      errors.csv_file = 'Contact list CSV is required';
    } else if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      errors.csv_file = 'Please upload a CSV file';
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess('');
    setFormErrors({});

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Validate form
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      // Submit form
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess('Onboarding completed successfully!');
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Newsletter Onboarding
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your company details and upload your contact list to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className="rounded-md shadow-sm -space-y-px bg-white p-4">
            <div className="mb-4">
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                id="company_name"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.company_name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your company name"
              />
              {formErrors.company_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.company_name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                Website URL (Optional)
              </label>
              <input
                type="url"
                name="website_url"
                id="website_url"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.website_url
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="https://example.com"
              />
              {formErrors.website_url && (
                <p className="mt-1 text-sm text-red-600">{formErrors.website_url}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                id="contact_email"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.contact_email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="you@example.com"
              />
              {formErrors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contact_email}</p>
              )}
            </div>

            <div>
              <label htmlFor="csv_file" className="block text-sm font-medium text-gray-700">
                Contact List (CSV)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="csv_file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="csv_file"
                        name="csv_file"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV file up to 10MB</p>
                </div>
              </div>
              {formErrors.csv_file && (
                <p className="mt-1 text-sm text-red-600">{formErrors.csv_file}</p>
              )}
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
