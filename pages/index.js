import { useState } from 'react';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = (formData) => {
    const errors = {};
    
    // Company name validation
    if (!formData.get('company_name')?.trim()) {
      errors.company_name = 'Company name is required';
    }

    // Website URL validation
    const websiteUrl = formData.get('website_url')?.trim();
    if (websiteUrl && !websiteUrl.match(/^https?:\/\/.*\..+$/)) {
      errors.website_url = 'Please enter a valid URL starting with http:// or https://';
    }

    // Email validation
    const email = formData.get('contact_email')?.trim();
    if (!email) {
      errors.contact_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.contact_email = 'Please enter a valid email address';
    }

    // Phone validation
    const phone = formData.get('phone_number')?.trim();
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      errors.phone_number = 'Please enter a valid phone number';
    }

    // Industry validation
    if (!formData.get('industry')) {
      errors.industry = 'Please select an industry';
    }

    // Audience description validation
    if (!formData.get('audience_description')?.trim()) {
      errors.audience_description = 'Audience description is required';
    }

    // Newsletter objectives validation
    if (!formData.getAll('newsletter_objectives').length) {
      errors.newsletter_objectives = 'Newsletter objectives are required';
    }

    // Primary CTA validation
    if (!formData.get('primary_cta')?.trim()) {
      errors.primary_cta = 'Primary call-to-action is required';
    }

    // CSV file validation
    const file = formData.get('contact_list');
    if (!file) {
      errors.contact_list = 'Please upload a CSV file';
    } else if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.contact_list = 'File must be a CSV';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess('');
    setFormErrors({});

    try {
      const formData = new FormData(e.target);
      
      // Get selected newsletter objectives
      const selectedObjectives = Array.from(e.target.querySelectorAll('input[name="newsletter_objectives"]:checked'))
        .map(checkbox => checkbox.value);
      
      // Remove individual newsletter objectives from FormData
      formData.delete('newsletter_objectives');
      
      // Add selected objectives as an array
      selectedObjectives.forEach(objective => {
        formData.append('newsletter_objectives', objective);
      });

      // Log form data for debugging
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // Client-side validation
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      console.log('Sending form data to server...');
      let response;
      try {
        response = await fetch('/api/onboarding', {
          method: 'POST',
          body: formData,
        });
      } catch (fetchError) {
        console.error('Network error:', fetchError);
        throw new Error('Network error: ' + fetchError.message);
      }

      console.log('Server response status:', response.status);
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error('Error parsing server response');
      }
      console.log('Server response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('Onboarding successful! Processing your information...');
      e.target.reset();
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Newsletter Generator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start by providing your company information
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} />}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Company Name */}
            <div className="mb-4">
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="company-name"
                name="company_name"
                type="text"
                placeholder="e.g., Innovative Solutions LLC"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.company_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.company_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.company_name}</p>
              )}
            </div>

            {/* Website URL */}
            <div className="mb-4">
              <label htmlFor="website-url" className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <input
                id="website-url"
                name="website_url"
                type="url"
                placeholder="e.g., https://www.yourcompany.com"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.website_url ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.website_url && (
                <p className="mt-1 text-sm text-red-600">{formErrors.website_url}</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="mb-4">
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                id="contact-email"
                name="contact_email"
                type="email"
                placeholder="e.g., contact@yourcompany.com"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.contact_email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contact_email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone-number"
                name="phone_number"
                type="tel"
                placeholder="e.g., +1 234 567 8901"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone_number}</p>
              )}
            </div>

            {/* Industry */}
            <div className="mb-4">
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                What industry does your business operate in?
              </label>
              <select
                id="industry"
                name="industry"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.industry && (
                <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>
              )}
            </div>

            {/* Audience Description */}
            <div className="mb-4">
              <label htmlFor="audience-description" className="block text-sm font-medium text-gray-700">
                Audience Description
              </label>
              <textarea
                id="audience-description"
                name="audience_description"
                rows="3"
                placeholder="e.g., Young adults interested in tech gadgets"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.audience_description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.audience_description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.audience_description}</p>
              )}
            </div>

            {/* Newsletter Objectives */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Newsletter Objectives
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="brand-awareness"
                    name="newsletter_objectives"
                    type="checkbox"
                    value="Brand Awareness"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="brand-awareness" className="ml-2 text-sm text-gray-700">
                    Brand Awareness
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="lead-generation"
                    name="newsletter_objectives"
                    type="checkbox"
                    value="Lead Generation"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lead-generation" className="ml-2 text-sm text-gray-700">
                    Lead Generation
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="customer-engagement"
                    name="newsletter_objectives"
                    type="checkbox"
                    value="Customer Engagement"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="customer-engagement" className="ml-2 text-sm text-gray-700">
                    Customer Engagement
                  </label>
                </div>
              </div>
              {formErrors.newsletter_objectives && (
                <p className="mt-1 text-sm text-red-600">{formErrors.newsletter_objectives}</p>
              )}
            </div>

            {/* Primary CTA */}
            <div className="mb-4">
              <label htmlFor="primary-cta" className="block text-sm font-medium text-gray-700">
                Primary Call-to-Action
              </label>
              <input
                id="primary-cta"
                name="primary_cta"
                type="text"
                placeholder="e.g., Visit Website, Contact Sales"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.primary_cta ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.primary_cta && (
                <p className="mt-1 text-sm text-red-600">{formErrors.primary_cta}</p>
              )}
            </div>

            {/* Contact List Upload */}
            <div className="mb-4">
              <label htmlFor="contact-list" className="block text-sm font-medium text-gray-700">
                Upload Contact List (CSV)
              </label>
              <input
                id="contact-list"
                name="contact_list"
                type="file"
                accept=".csv"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.contact_list ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.contact_list && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contact_list}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Ensure your contact CSV file only contains two columns: Name and Email.
              </p>
            </div>
          </div>

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Submit Onboarding Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
