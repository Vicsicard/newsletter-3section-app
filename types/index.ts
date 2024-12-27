// Company Types
export interface Company {
  id: string;
  name: string;
  website_url?: string;
  contact_email: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

// Contact Types
export interface Contact {
  id: string;
  email: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

// Newsletter Types
export interface Newsletter {
  id: string;
  company_id: string;
  status: string;
  industry_summary: string;
  section1_content: string;
  section2_content: string;
  section3_content: string;
  created_at?: string;
  updated_at?: string;
  sent_at?: string;
  sent_count?: number;
  failed_count?: number;
  last_sent_status?: string;
  newsletter_objectives?: string;
  primary_cta?: string;
  companies: {
    company_name: string;
    industry: string;
    contact_email: string;
  };
  newsletter_contacts: NewsletterContact[];
}

// Newsletter Contact Types
export interface NewsletterContact {
  id: string;
  newsletter_id: string;
  contact_id: string;
  created_at?: string;
  contacts: Contact;
}

// CSV Upload Types
export interface CSVUpload {
  id: string;
  company_id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  processed_rows?: number;
  failed_rows?: number;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

// API Response Types
export interface OnboardingResponse {
  success: boolean;
  message: string;
  data?: {
    company_id: string;
    total_contacts: number;
    failed_contacts: number;
    status: 'success' | 'partial' | 'failed';
    newsletter_id?: string;
  };
  error?: {
    code: string;
    details?: string;
  };
}

// Form Types
export interface FormErrors {
  company_name?: string;
  website_url?: string;
  contact_email?: string;
  csv_file?: string;
}
