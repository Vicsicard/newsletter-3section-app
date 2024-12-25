import { useState, FormEvent } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import type { FormErrors } from '@/types/form';

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

    // Logo file validation
    const logoFile = formData.get('logo_file') as File | null;
    if (logoFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(logoFile.type)) {
        errors.logo_file = 'Please upload a JPEG, PNG, or GIF file';
      } else if (logoFile.size > 5 * 1024 * 1024) { // 5MB
        errors.logo_file = 'File size must be less than 5MB';
      }
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

    // Phone number validation
    const phone = formData.get('phone_number')?.toString().trim();
    if (phone && !phone.match(/^\+?[\d\s-()]{10,}$/)) {
      errors.phone_number = 'Please enter a valid phone number';
    }

    // Industry validation
    if (!formData.get('industry')?.toString().trim()) {
      errors.industry = 'Please select an industry';
    }

    // Target audience description validation
    if (!formData.get('target_audience')?.toString().trim()) {
      errors.target_audience = 'Target audience description is required';
    }

    // Contact list validation
    const contactList = formData.get('contact_list') as File | null;
    if (!contactList) {
      errors.contact_list = 'Contact list CSV is required';
    } else if (!contactList.name.toLowerCase().endsWith('.csv')) {
      errors.contact_list = 'Please upload a CSV file';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Digital Rascal Marketing Onboarding Form
          </h1>
          <p className="text-lg text-gray-600">Let's get started with your marketing journey</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              id="company_name"
              placeholder="e.g., Digital Rascal Solutions"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.company_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.company_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              name="website_url"
              id="website_url"
              placeholder="e.g., https://digitalrascal.com"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.website_url && (
              <p className="mt-1 text-sm text-red-600">{formErrors.website_url}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
              Contact Email *
            </label>
            <input
              type="email"
              name="contact_email"
              id="contact_email"
              placeholder="e.g., marketing@digitalrascal.com"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.contact_email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              id="phone_number"
              placeholder="e.g., +1 (555) 123-4567"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.phone_number && (
              <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry *
            </label>
            <input
              type="text"
              name="industry"
              id="industry"
              placeholder="e.g., Technology, E-commerce, Healthcare"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.industry && (
              <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>
            )}
          </div>

          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">
              Target Audience Description
            </label>
            <textarea
              name="target_audience"
              id="target_audience"
              rows={4}
              placeholder="e.g., Small business owners aged 30-50 in the United States, interested in digital marketing solutions"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.target_audience && (
              <p className="mt-1 text-sm text-red-600">{formErrors.target_audience}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Logo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
                          border-dashed rounded-lg hover:border-indigo-300 transition-colors duration-200">
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
                    htmlFor="logo_file"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="logo_file"
                      name="logo_file"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            {formErrors.logo_file && (
              <p className="mt-1 text-sm text-red-600">{formErrors.logo_file}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_list" className="block text-sm font-medium text-gray-700">
              Contact List (CSV)
            </label>
            <input
              type="file"
              name="contact_list"
              id="contact_list"
              accept=".csv"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 
                       shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                       hover:border-indigo-300 transition-colors duration-200"
            />
            {formErrors.contact_list && (
              <p className="mt-1 text-sm text-red-600">{formErrors.contact_list}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
                       text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600
                       hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Onboarding Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
