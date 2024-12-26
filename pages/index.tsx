import { useState, FormEvent } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import type { FormErrors } from '@/types/form';
import { useRouter } from 'next/router';
import LoadingModal from '@/components/LoadingModal';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');

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
    setIsLoading(true);
    setShowModal(true);
    setError(null);
    setFormErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    setEmail(formData.get('contact_email') as string);

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      setShowModal(false);
      return;
    }

    // Use the new route path
    const url = '/api/onboarding/route';
    console.log('Submitting to:', url);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      
      xhr.onload = function() {
        console.log('Response received:', {
          status: xhr.status,
          statusText: xhr.statusText,
          response: xhr.responseText
        });

        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && response.success) {
            setIsSuccess(true);
            setSuccess(response.message || 'Successfully processed your request');
            if (response.company?.id) {
              console.log('Company created:', response.company);
            }
            resolve(response);
          } else {
            const error = new Error(response.message || `Server error: ${xhr.status}`);
            console.error('Server error:', error);
            setError(error.message);
            setIsSuccess(false);
            reject(error);
          }
        } catch (error) {
          console.error('Response parsing error:', error);
          setError('Failed to process server response');
          setIsSuccess(false);
          reject(error);
        }
        setIsLoading(false);
        setShowModal(false);
      };

      xhr.onerror = function(e) {
        console.error('XHR error:', e);
        setError('Network error occurred');
        setIsSuccess(false);
        setIsLoading(false);
        setShowModal(false);
        reject(new Error('Network error'));
      };

      // Send the form data
      xhr.send(formData);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSuccess(false);
    if (isSuccess) {
      // Reset form or redirect
      router.push('/');
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

        <form 
          id="onboardingForm"
          className="space-y-6" 
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/onboarding', true);
            
            xhr.onload = function() {
              console.log('Response received:', {
                status: xhr.status,
                statusText: xhr.statusText,
                response: xhr.responseText
              });
              
              if (xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.success) {
                    setIsSuccess(true);
                    setSuccess(response.message || 'Success!');
                  } else {
                    setError(response.message || 'Request failed');
                  }
                } catch (err) {
                  setError('Failed to parse response');
                }
              } else {
                setError(`Server error: ${xhr.status}`);
              }
              
              setIsLoading(false);
              setShowModal(false);
            };
            
            xhr.onerror = function() {
              setError('Network error occurred');
              setIsLoading(false);
              setShowModal(false);
            };
            
            setIsLoading(true);
            setShowModal(true);
            xhr.send(formData);
          }}
        >
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

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
        <LoadingModal 
          isOpen={showModal}
          email={email}
          isSuccess={isSuccess}
          onClose={() => {
            setShowModal(false);
            if (isSuccess) {
              router.push('/');
            }
          }}
          error={error}
        />
      </div>
    </div>
  );
}
