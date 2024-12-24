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
  company_id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

// Newsletter Types
export interface Newsletter {
  id: string;
  company_id: string;
  status: 'draft' | 'pending_approval' | 'revision_requested' | 'approved' | 'scheduled' | 'sent';
  created_at: string;
  updated_at?: string;
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
    newsletter_id?: string;
  };
}

// Form Types
export interface FormErrors {
  company_name?: string;
  website_url?: string;
  contact_email?: string;
  csv_file?: string;
}
