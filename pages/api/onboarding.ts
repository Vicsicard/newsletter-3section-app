import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import fs from 'fs/promises';
import type { OnboardingResponse, Company } from '@/types/form';
import { ApiError } from '@/utils/errorHandler';

// Disable body parsing, we'll handle the form data manually
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OnboardingResponse>
) {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
    return;
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024,
      multiples: true,
      filter: (part: formidable.Part) => {
        // Allow only CSV files
        if (part.mimetype?.includes('csv')) return true;
        return false;
      },
    });
    
    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files) => {
        if (err) reject(new ApiError(400, `File upload error: ${err.message}`));
        resolve([fields, files]);
      });
    });

    // Type assertions for form fields
    const companyName = fields.company_name?.toString();
    const websiteUrl = fields.website_url?.toString();
    const contactEmail = fields.contact_email?.toString();
    const phoneNumber = fields.phone_number?.toString();
    const industry = fields.industry?.toString();
    const targetAudience = fields.target_audience?.toString();

    // Validate required fields
    if (!companyName || !contactEmail || !industry || !targetAudience) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Validate files
    const csvFiles = files.contact_list;
    if (!csvFiles || !Array.isArray(csvFiles) || csvFiles.length === 0) {
      throw new ApiError(400, 'Contact list CSV is required');
    }
    const csvFile = csvFiles[0];

    // Basic validation
    if (websiteUrl && !websiteUrl.match(/^https?:\/\/.*\..+$/)) {
      throw new ApiError(400, 'Invalid website URL');
    }

    if (!contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new ApiError(400, 'Invalid email address');
    }

    if (phoneNumber && !phoneNumber.match(/^\+?[\d\s-()]{10,}$/)) {
      throw new ApiError(400, 'Invalid phone number');
    }

    // Check if company exists
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id, version')
      .eq('contact_email', contactEmail)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    // Create or update company record
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([
        {
          company_name: companyName,
          website_url: websiteUrl || null,
          contact_email: contactEmail,
          phone_number: phoneNumber || null,
          industry,
          target_audience: targetAudience,
          status: 'active',
          version: existingCompany ? (existingCompany.version + 1) : 1
        }
      ])
      .select()
      .single();

    if (companyError || !company) {
      throw new ApiError(500, `Failed to create company: ${companyError?.message}`);
    }

    // Read and parse CSV file
    const fileContent = await fs.readFile(csvFile.filepath, 'utf-8');
    let contacts: any[] = [];
    try {
      contacts = await parseCSV(fileContent);
      console.log(`Parsed ${contacts.length} contacts from CSV`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new ApiError(400, 'Failed to parse CSV file. Ensure it contains only Name and Email columns.');
    }

    // Insert contacts into database
    const batchSize = 100;
    let failedContacts = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize).map(contact => ({
        company_id: company.id,
        name: contact.name,
        email: contact.email,
        status: 'active',
        created_at: new Date().toISOString(),
      }));

      const { error: contactsError } = await supabaseAdmin
        .from('contacts')
        .insert(batch);

      if (contactsError) {
        console.error(`Failed to insert batch ${i / batchSize + 1}:`, contactsError);
        failedContacts += batch.length;
      }
    }

    // Clean up temporary files
    await fs.unlink(csvFile.filepath);

    // Generate newsletter content
    try {
      console.log('Generating newsletter for company:', company.id);
      
      const response = await fetch(`${process.env.BASE_URL || ''}/api/generate-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Newsletter generation failed:', errorText);
        throw new Error(`Failed to generate newsletter: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Newsletter generation successful:', responseData);
    } catch (error: any) {
      console.error('Error generating newsletter:', error);
      throw new Error(`Failed to generate newsletter: ${error instanceof Error ? error.message : String(error)}`);
    }

    const successfulContacts = contacts.length - failedContacts;
    const companyResponse: Company = {
      id: company.id,
      company_name: company.company_name,
      website_url: company.website_url,
      contact_email: company.contact_email,
      phone_number: company.phone_number,
      industry: company.industry,
      target_audience: company.target_audience,
      audience_description: '',
      newsletter_objectives: '',
      primary_cta: '',
      contacts_count: successfulContacts,
    };

    res.status(200).json({
      success: true,
      message: `Successfully created company and imported ${successfulContacts} contacts${
        failedContacts > 0 ? ` (${failedContacts} failed)` : ''
      }. Newsletter generation started.`,
      company: companyResponse,
    });
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }

    // Handle Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          message: 'A company with this email already exists'
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    });
  }
}
