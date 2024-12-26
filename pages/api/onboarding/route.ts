import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import { generateNewsletterContent } from '@/utils/newsletter';
import fs from 'fs/promises';
import type { OnboardingResponse, Company } from '@/types/form';
import { ApiError } from '@/utils/errorHandler';

// Disable body parsing, we'll handle the form data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Initialize response object
  let responseData = {
    success: false,
    message: '',
    company: null as any
  };

  try {
    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }

    // Check if companies table exists
    console.log('Checking companies table...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('Table check error:', {
        error: tableError,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      });
      throw new Error(`Failed to access companies table: ${tableError.message}`);
    }

    console.log('Companies table accessible');

    console.log('Starting form parsing...');
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max file size
      multiples: true,
      allowEmptyFiles: true,
      filter: function(part: any): boolean {
        // Only process CSV files if they exist
        return part.name === 'contact_list' ? part.originalFilename?.toLowerCase().endsWith('.csv') || false : true;
      },
    });

    type FormFields = {
      [key: string]: string | string[];
    };

    type FormFiles = {
      [key: string]: formidable.File | formidable.File[];
    };

    // Parse form data with proper typing
    const [fields, files] = await new Promise<[FormFields, FormFiles]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: FormFields, files: FormFiles) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
        } else {
          console.log('Form fields:', fields);
          console.log('Form files:', Object.keys(files).length ? files : 'No files uploaded');
          resolve([fields, files]);
        }
      });
    });

    // Extract company data
    const companyData = {
      company_name: Array.isArray(fields.company_name) ? fields.company_name[0] : fields.company_name,
      website_url: Array.isArray(fields.website_url) ? fields.website_url[0] : fields.website_url,
      contact_email: Array.isArray(fields.contact_email) ? fields.contact_email[0] : fields.contact_email,
      phone_number: Array.isArray(fields.phone_number) ? fields.phone_number[0] : fields.phone_number,
      industry: Array.isArray(fields.industry) ? fields.industry[0] : fields.industry,
      target_audience: Array.isArray(fields.target_audience) ? fields.target_audience[0] : fields.target_audience,
      audience_description: Array.isArray(fields.audience_description) ? fields.audience_description[0] : fields.audience_description,
      newsletter_objectives: Array.isArray(fields.newsletter_objectives) ? fields.newsletter_objectives[0] : fields.newsletter_objectives,
      primary_cta: Array.isArray(fields.primary_cta) ? fields.primary_cta[0] : fields.primary_cta,
      contacts_count: 0, // Will be updated after processing contacts
      created_at: new Date().toISOString(),
    };

    // Insert company data
    console.log('Inserting company data...');
    const { data: company, error: insertError } = await supabaseAdmin
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (insertError) {
      console.error('Company insertion error:', insertError);
      throw new Error(`Failed to insert company data: ${insertError.message}`);
    }

    console.log('Company data inserted successfully');

    // Process contact list if provided
    let contacts = [];
    if (files.contact_list) {
      const file = Array.isArray(files.contact_list) ? files.contact_list[0] : files.contact_list;
      const fileContent = await fs.readFile(file.filepath, 'utf-8');
      contacts = await parseCSV(fileContent);
      console.log(`Parsed ${contacts.length} contacts from CSV`);
    }

    // Generate newsletter content
    console.log('Generating newsletter content...');
    const newsletterContent = await generateNewsletterContent({
      companyName: companyData.company_name,
      industry: companyData.industry,
      targetAudience: companyData.target_audience,
      companyDescription: companyData.audience_description || '',
    });

    // Insert newsletter data
    console.log('Inserting newsletter data...');
    const { error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .insert([{
        company_id: company.id,
        content: newsletterContent.content,
        title: newsletterContent.title || `${companyData.company_name} Newsletter`,
        created_at: new Date().toISOString(),
      }]);

    if (newsletterError) {
      console.error('Newsletter insertion error:', newsletterError);
      throw new Error(`Failed to insert newsletter data: ${newsletterError.message}`);
    }

    console.log('Newsletter data inserted successfully');

    // Set success response
    responseData = {
      success: true,
      message: 'Company and newsletter created successfully',
      company: company
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in onboarding process:', error);
    const apiError = error instanceof ApiError ? error : new ApiError('Internal server error', 500);
    res.status(apiError.statusCode).json({
      success: false,
      message: apiError.message
    });
  }
}

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin.from('companies').select('count').limit(0);
    return !error;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}
