export interface FormErrors {
  company_name?: string;
  website_url?: string;
  contact_email?: string;
  phone_number?: string;
  industry?: string;
  target_audience?: string;
  audience_description?: string;
  newsletter_objectives?: string;
  primary_cta?: string;
  contact_list?: string;
}

export interface Company {
  id?: string;
  name: string;
  website_url?: string;
  contact_email: string;
  phone_number?: string;
  industry: string;
  target_audience: string;
  company_description?: string;
  created_at?: string;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  company?: Company;
  error?: string;
}
