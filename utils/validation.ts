import { FormErrors } from '@/types/form';

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  // Company Name validation
  const companyName = formData.get('company_name') as string;
  if (!companyName || companyName.trim().length === 0) {
    errors.company_name = 'Company name is required';
  }

  // Website URL validation
  const websiteUrl = formData.get('website_url') as string;
  if (!websiteUrl || websiteUrl.trim().length === 0) {
    errors.website_url = 'Website URL is required';
  } else if (!/^https?:\/\/.*/.test(websiteUrl)) {
    errors.website_url = 'Please enter a valid URL starting with http:// or https://';
  }

  // Target Audience validation
  const targetAudience = formData.get('target_audience') as string;
  if (!targetAudience || targetAudience.trim().length === 0) {
    errors.target_audience = 'Target audience is required';
  }

  // Email validation
  const email = formData.get('email') as string;
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Audience Description validation
  const audienceDescription = formData.get('audience_description') as string;
  if (!audienceDescription || audienceDescription.trim().length === 0) {
    errors.audience_description = 'Audience description is required';
  }

  // Newsletter Objectives validation
  const objectives = formData.get('newsletter_objectives') as string;
  if (!objectives || objectives.trim().length === 0) {
    errors.newsletter_objectives = 'Newsletter objectives are required';
  }

  // Primary CTA validation
  const primaryCta = formData.get('primary_cta') as string;
  if (!primaryCta || primaryCta.trim().length === 0) {
    errors.primary_cta = 'Primary CTA is required';
  }

  // Industry validation
  const industry = formData.get('industry') as string;
  if (!industry || industry.trim().length === 0) {
    errors.industry = 'Please select an industry';
  }

  // Phone number validation
  const phoneNumber = formData.get('phone_number') as string;
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    errors.phone_number = 'Phone number is required';
  } else if (!/^\+?[\d\s-()]+$/.test(phoneNumber)) {
    errors.phone_number = 'Please enter a valid phone number';
  }

  // Contact list validation (optional)
  const contactList = formData.get('contact_list') as File;
  if (contactList && contactList.size > 0) {
    if (!contactList.name.toLowerCase().endsWith('.csv')) {
      errors.contact_list = 'Please upload a CSV file';
    } else if (contactList.size > 5 * 1024 * 1024) { // 5MB limit
      errors.contact_list = 'File size should be less than 5MB';
    }
  }

  return errors;
};
