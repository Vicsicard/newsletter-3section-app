export interface FormErrors {
  company_name?: string;
  logo_file?: string;
  website_url?: string;
  contact_email?: string;
  phone_number?: string;
  industry?: string;
  audience_description?: string;
  newsletter_objectives?: string;
  primary_cta?: string;
  csv_file?: string;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    company_name: string;
    logo_url?: string;
    website_url?: string;
    contact_email: string;
    phone_number?: string;
    industry: string;
    audience_description: string;
    newsletter_objectives: string;
    primary_cta: string;
    contacts_count: number;
  };
}
