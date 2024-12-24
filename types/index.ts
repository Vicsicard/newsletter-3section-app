export interface Company {
  id: string;
  company_name: string;
  website_url?: string;
  contact_email: string;
  phone_number?: string;
  industry: string;
  audience_description: string;
  newsletter_objectives: string[];
  primary_cta: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  email: string;
  name: string;
  is_active: boolean;
  csv_batch_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  company_id: string;
  title: string;
  industry_info?: any;
  section1_content?: string;
  section1_image_url?: string;
  section2_content?: string;
  section2_image_url?: string;
  section3_content?: string;
  section3_image_url?: string;
  status: 'draft' | 'pending_approval' | 'revision_requested' | 'approved' | 'scheduled' | 'sent';
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CSVUpload {
  id: string;
  company_id: string;
  filename: string;
  processed_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponse {
  success: boolean;
  data?: {
    company: Company;
    newsletter: Newsletter;
    contacts_processed: number;
  };
  error?: string;
}
