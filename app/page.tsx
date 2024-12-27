'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { validateForm } from '@/utils/validation';
import { industryTemplates, getIndustryNames } from '@/utils/industryTemplates';
import LoadingModal from '@/components/LoadingModal';
import SuccessModal from '@/components/SuccessModal';
import ErrorModal from '@/components/ErrorModal';
import { FormErrors } from '@/types/form';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    company_name: '',
    website_url: '',
    target_audience: '',
    audience_description: '',
    newsletter_objectives: '',
    primary_cta: '',
    industry: ''
  });
  const [currentSection, setCurrentSection] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const totalSections = 4;

  // Add refs for focus management
  const firstInputRef = useRef<HTMLInputElement>(null);
  const industryButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Add callback for ref setting
  const setIndustryButtonRef = useCallback((el: HTMLButtonElement | null, index: number) => {
    industryButtonsRef.current[index] = el;
  }, []);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Handle modal focus trap
  useEffect(() => {
    if (isLoading || error || success) {
      modalRef.current?.focus();
      
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isLoading, error, success]);

  // Handle keyboard navigation for industry selection
  const handleIndustryKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, industry: string) => {
    const currentIndex = getIndustryNames().findIndex(i => i.value === industry);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % getIndustryNames().length;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + getIndustryNames().length) % getIndustryNames().length;
        e.preventDefault();
        break;
      case 'ArrowDown':
        nextIndex = (currentIndex + 3) % getIndustryNames().length;
        e.preventDefault();
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 3 + getIndustryNames().length) % getIndustryNames().length;
        e.preventDefault();
        break;
    }

    industryButtonsRef.current[nextIndex]?.focus();
  };

  // Calculate form progress
  useEffect(() => {
    const calculateProgress = () => {
      const fields = Object.values(formData);
      const filledFields = fields.filter(field => field.length > 0).length;
      return Math.round((filledFields / fields.length) * 100);
    };
    setFormProgress(calculateProgress());
  }, [formData]);

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    try {
      console.log('Submitting form data...');
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(5 * 60 * 1000)
      });

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error('Request timed out. Please try again.');
        }
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (e) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setIsSuccess(true);
        setSuccess(data.message || 'Successfully processed your request');
        if (data.data?.company_id) {
          // Get the latest newsletter for this company
          const newsletterResponse = await fetch(`/api/company/${data.data.company_id}/latest-newsletter`);
          const newsletterData = await newsletterResponse.json();
          
          if (newsletterData.success && newsletterData.data?.id) {
            // Redirect to the newsletter page
            router.push(`/newsletter/${newsletterData.data.id}`);
          } else {
            throw new Error('Failed to get newsletter ID');
          }
        }
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process request');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setSuccess(null);
  };

  // Update renderIndustrySelector to include keyboard navigation
  const renderIndustrySelector = () => (
    <div 
      className="mb-6"
      role="radiogroup"
      aria-label="Select your industry"
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Your Industry
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {getIndustryNames().map(({ value, label, icon }, index) => (
          <button
            key={value}
            type="button"
            ref={(el) => setIndustryButtonRef(el, index)}
            onClick={() => handleIndustrySelect(value)}
            onKeyDown={(e) => handleIndustryKeyDown(e, value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              formData.industry === value
                ? 'border-[#2563EB] bg-blue-50'
                : 'border-gray-200 hover:border-[#2563EB]'
            }`}
            role="radio"
            aria-checked={formData.industry === value}
            tabIndex={formData.industry === value ? 0 : -1}
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const handleIndustrySelect = (industry: string) => {
    const template = industryTemplates[industry];
    setFormData(prev => ({
      ...prev,
      industry,
      target_audience: template.targetAudience,
      audience_description: template.audienceDescription,
      newsletter_objectives: template.newsletterObjectives,
      primary_cta: template.primaryCTA
    }));
  };

  return (
    <div className="min-h-screen bg-[#2563EB] relative">
      {/* Fixed Progress Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-32 bg-[#1E40AF] flex flex-col items-center justify-between py-8 z-10"
        role="complementary"
        aria-label="Form progress tracker"
      >
        {/* Header */}
        <div className="text-white text-center px-2">
          <h3 className="font-medium text-sm mb-1" id="progress-title">Form Progress</h3>
          <p className="text-xs text-white/80" id="progress-description">Complete all sections</p>
        </div>

        {/* Progress Section */}
        <div 
          className="flex-1 flex flex-col items-center justify-center w-full px-4 relative"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={formProgress}
          aria-labelledby="progress-title"
          aria-describedby="progress-description"
        >
          {/* Vertical Progress Bar */}
          <div className="relative h-3/4 w-2 bg-white/30 rounded-full mx-auto">
            <div 
              className="absolute bottom-0 w-2 bg-white rounded-full transition-all duration-500 ease-out"
              style={{ height: `${formProgress}%` }}
            />
          </div>
          
          {/* Section Indicators */}
          <div className="absolute inset-0 flex flex-col justify-around items-center">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div key={index} className="relative group">
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index + 1 <= currentSection ? 'bg-white' : 'bg-white/30'
                  } flex items-center justify-center`}
                >
                  {index + 1 <= currentSection && (
                    <div className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                  )}
                </div>
                {/* Enhanced Tooltip */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-white text-[#1E40AF] px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                  <div className="font-medium">
                    {index === 0 && "Company Info"}
                    {index === 1 && "Target Audience"}
                    {index === 2 && "Newsletter Strategy"}
                    {index === 3 && "Contact List"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {index === 0 && "Basic company details"}
                    {index === 1 && "Define your audience"}
                    {index === 2 && "Set newsletter goals"}
                    {index === 3 && "Upload contacts"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Progress Info */}
        <div className="text-center text-white px-2">
          <div className="text-2xl font-bold mb-1">{formProgress}%</div>
          <div className="text-xs text-white/80">
            {formProgress < 100 ? (
              <>
                <span className="font-medium">{4 - Math.ceil(formProgress/25)}</span> sections left
              </>
            ) : (
              <span className="text-green-300">All set! ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-40 pr-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Onboarding Newsletter Form
            </h1>
            <p className="text-xl text-white/90">Create engaging newsletters that resonate with your audience</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                  {/* Company Information Section */}
                  <div className="bg-[#4B83FB]/10 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-[#2563EB] mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      Company Information
                    </h2>
                    
                    {/* Add Industry Selector here */}
                    {renderIndustrySelector()}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="col-span-2 md:col-span-1">
                        <label 
                          htmlFor="company_name" 
                          className="block text-sm font-medium text-gray-700"
                          id="company-name-label"
                        >
                          Company Name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            ref={firstInputRef}
                            type="text"
                            name="company_name"
                            id="company_name"
                            placeholder="e.g., Acme Corporation"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.company_name ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="company-name-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.company_name}
                            aria-describedby={formErrors.company_name ? "company-name-error" : undefined}
                          />
                        </div>
                        {formData.company_name && (
                          <div className="mt-1 text-sm">
                            {formData.company_name.length < 3 ? (
                              <span className="text-yellow-500">Company name should be at least 3 characters</span>
                            ) : (
                              <span className="text-green-500">✓ Looks good!</span>
                            )}
                          </div>
                        )}
                        {formErrors.company_name && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="company-name-error"
                            role="alert"
                          >
                            {formErrors.company_name}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 md:col-span-1">
                        <label 
                          htmlFor="website_url" 
                          className="block text-sm font-medium text-gray-700"
                          id="website-url-label"
                        >
                          Website URL
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="url"
                            name="website_url"
                            id="website_url"
                            placeholder="e.g., https://www.acmecorp.com"
                            value={formData.website_url}
                            onChange={handleInputChange}
                            onBlur={(e) => {
                              // Auto-format URL if needed
                              let url = e.target.value;
                              if (url && !url.startsWith('http')) {
                                url = 'https://' + url;
                                setFormData(prev => ({
                                  ...prev,
                                  website_url: url
                                }));
                              }
                            }}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.website_url ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="website-url-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.website_url}
                            aria-describedby={formErrors.website_url ? "website-url-error" : undefined}
                          />
                        </div>
                        {formData.website_url && (
                          <div className="mt-1 text-sm">
                            {!/^https?:\/\/.*/.test(formData.website_url) ? (
                              <span className="text-yellow-500">Please enter a valid URL starting with http:// or https://</span>
                            ) : (
                              <span className="text-green-500">✓ Valid URL format</span>
                            )}
                          </div>
                        )}
                        {formErrors.website_url && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="website-url-error"
                            role="alert"
                          >
                            {formErrors.website_url}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Audience Section */}
                  <div className="bg-[#4B83FB]/10 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-[#2563EB] mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      Target Audience
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700">Target Audience</label>
                        <p className="text-sm text-gray-500 mb-1">Who are your ideal customers or clients?</p>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="target_audience"
                            id="target_audience"
                            placeholder="e.g., Small Business Owners, IT Professionals"
                            value={formData.target_audience}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.target_audience ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="target-audience-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.target_audience}
                            aria-describedby={formErrors.target_audience ? "target-audience-error" : undefined}
                          />
                        </div>
                        {formErrors.target_audience && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="target-audience-error"
                            role="alert"
                          >
                            {formErrors.target_audience}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="audience_description" className="block text-sm font-medium text-gray-700">Audience Description</label>
                        <p className="text-sm text-gray-500 mb-1">The more details you provide, the better we can tailor the content.</p>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <textarea
                            name="audience_description"
                            id="audience_description"
                            rows={4}
                            placeholder="Describe your audience's pain points, challenges, goals, and what motivates them..."
                            value={formData.audience_description}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.audience_description ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="audience-description-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.audience_description}
                            aria-describedby={formErrors.audience_description ? "audience-description-error" : undefined}
                          />
                        </div>
                        {formErrors.audience_description && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="audience-description-error"
                            role="alert"
                          >
                            {formErrors.audience_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Newsletter Strategy Section */}
                  <div className="bg-[#4B83FB]/10 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-[#2563EB] mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Newsletter Strategy
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="newsletter_objectives" className="block text-sm font-medium text-gray-700">Newsletter Objectives</label>
                        <p className="text-sm text-gray-500 mb-1">What do you want to achieve? Be specific for better results.</p>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <textarea
                            name="newsletter_objectives"
                            id="newsletter_objectives"
                            rows={4}
                            placeholder="e.g., Educate customers about new services, establish thought leadership..."
                            value={formData.newsletter_objectives}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.newsletter_objectives ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="newsletter-objectives-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.newsletter_objectives}
                            aria-describedby={formErrors.newsletter_objectives ? "newsletter-objectives-error" : undefined}
                          />
                        </div>
                        {formErrors.newsletter_objectives && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="newsletter-objectives-error"
                            role="alert"
                          >
                            {formErrors.newsletter_objectives}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="primary_cta" className="block text-sm font-medium text-gray-700">Primary Call to Action</label>
                        <p className="text-sm text-gray-500 mb-1">What's the main action you want readers to take?</p>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="primary_cta"
                            id="primary_cta"
                            placeholder="e.g., Schedule a Demo, Sign Up for Free Trial"
                            value={formData.primary_cta}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-[#2563EB] focus:border-[#2563EB] hover:border-[#2563EB] hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                              formErrors.primary_cta ? 'border-red-500' : ''
                            }`}
                            aria-labelledby="primary-cta-label"
                            aria-required="true"
                            aria-invalid={!!formErrors.primary_cta}
                            aria-describedby={formErrors.primary_cta ? "primary-cta-error" : undefined}
                          />
                        </div>
                        {formErrors.primary_cta && (
                          <p 
                            className="mt-2 text-sm text-red-600"
                            id="primary-cta-error"
                            role="alert"
                          >
                            {formErrors.primary_cta}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact List Section */}
                  <div className="bg-[#4B83FB]/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-[#2563EB] mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Contact List
                    </h2>
                    <div className="mt-1">
                      <label htmlFor="contact_list" className="block text-sm font-medium text-gray-700">Upload Contact List (CSV)</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#2563EB] transition-colors duration-200">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="contact_list" className="relative cursor-pointer rounded-md font-medium text-[#2563EB] hover:text-[#1E40AF] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2563EB]">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                name="contact_list"
                                id="contact_list"
                                accept=".csv"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">CSV file up to 10MB</p>
                        </div>
                      </div>
                      {formErrors.contact_list && (
                        <p 
                          className="mt-2 text-sm text-red-600"
                          id="contact-list-error"
                          role="alert"
                        >
                          {formErrors.contact_list}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#2563EB] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-all duration-200 disabled:opacity-50"
                      aria-label={isLoading ? "Processing form submission" : "Generate Newsletter"}
                      aria-busy={isLoading}
                      aria-disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Generate Newsletter'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals with focus management */}
      {isLoading && (
        <LoadingModal ref={modalRef} />
      )}
      {error && (
        <ErrorModal 
          ref={modalRef}
          message={error} 
          onClose={() => {
            setError(null);
            firstInputRef.current?.focus();
          }}
        />
      )}
      {success && (
        <SuccessModal 
          ref={modalRef}
          message={success}
          onClose={() => {
            setSuccess(null);
            firstInputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
