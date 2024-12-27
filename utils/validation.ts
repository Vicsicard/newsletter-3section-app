import { FormErrors } from '@/types/form';

export function validateForm(formData: FormData): FormErrors {
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
  } else {
    try {
      new URL(websiteUrl);
    } catch (e) {
      errors.website_url = 'Please enter a valid URL';
    }
  }

  // Email validation
  const email = formData.get('contact_email') as string;
  if (!email || email.trim().length === 0) {
    errors.contact_email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.contact_email = 'Please enter a valid email address';
  }

  // Phone number validation
  const phoneNumber = formData.get('phone_number') as string;
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    errors.phone_number = 'Phone number is required';
  } else if (!/^\+?[\d\s-()]+$/.test(phoneNumber)) {
    errors.phone_number = 'Please enter a valid phone number';
  }

  // Industry validation
  const industry = formData.get('industry') as string;
  if (!industry || industry.trim().length === 0) {
    errors.industry = 'Industry is required';
  }

  // Target audience validation
  const targetAudience = formData.get('target_audience') as string;
  if (!targetAudience || targetAudience.trim().length === 0) {
    errors.target_audience = 'Target audience is required';
  }

  // Audience description validation
  const audienceDescription = formData.get('audience_description') as string;
  if (!audienceDescription || audienceDescription.trim().length === 0) {
    errors.audience_description = 'Audience description is required';
  }

  // Newsletter objectives validation
  const newsletterObjectives = formData.get('newsletter_objectives') as string;
  if (!newsletterObjectives || newsletterObjectives.trim().length === 0) {
    errors.newsletter_objectives = 'Newsletter objectives are required';
  }

  // Primary CTA validation
  const primaryCta = formData.get('primary_cta') as string;
  if (!primaryCta || primaryCta.trim().length === 0) {
    errors.primary_cta = 'Primary call to action is required';
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
}
