import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import fs from 'fs/promises';
import type { OnboardingResponse } from '@/types';
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
      maxFileSize: 1024 * 1024, // 1MB
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

    if (!companyName || !contactEmail) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Validate file
    const csvFiles = files.csv_file;
    if (!csvFiles || !Array.isArray(csvFiles) || csvFiles.length === 0) {
      throw new ApiError(400, 'CSV file is required');
    }
    const csvFile = csvFiles[0];

    // Basic validation
    if (websiteUrl && !websiteUrl.match(/^https?:\/\/.*\..+$/)) {
      throw new ApiError(400, 'Invalid website URL');
    }

    if (!contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new ApiError(400, 'Invalid email address');
    }

    // Create company record
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert([
        {
          name: companyName,
          website_url: websiteUrl || null,
          contact_email: contactEmail,
          status: 'active',
          created_at: new Date().toISOString(),
        },
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
      throw new ApiError(400, 'Failed to parse CSV file');
    }

    // Insert contacts into database
    const batchSize = 100;
    let failedContacts = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize).map(contact => ({
        ...contact,
        company_id: company.id,
        created_at: new Date().toISOString(),
      }));

      console.log(`Inserting batch ${i / batchSize + 1} of contacts...`);
      const { error: contactsError } = await supabaseAdmin
        .from('contacts')
        .insert(batch);

      if (contactsError) {
        console.error('Error inserting contacts batch:', contactsError);
        failedContacts += batch.length;
      }
    }

    // Create CSV upload record
    const { data: csvUpload, error: csvUploadError } = await supabaseAdmin
      .from('csv_uploads')
      .insert({
        company_id: company.id,
        filename: csvFile.originalFilename || 'unknown.csv',
        status: failedContacts === contacts.length ? 'failed' : 'completed',
        processed_rows: contacts.length - failedContacts,
        failed_rows: failedContacts,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (csvUploadError) {
      console.error('Error creating CSV upload record:', csvUploadError);
      throw new ApiError(500, 'Failed to create CSV upload record');
    }

    // Clean up uploaded file
    await fs.unlink(csvFile.filepath).catch(console.error);

    // Create initial newsletter draft
    console.log('Creating initial newsletter draft...');
    const { data: newsletter, error: newsletterError } = await supabaseAdmin
      .from('newsletters')
      .insert({
        company_id: company.id,
        status: 'draft',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (newsletterError) {
      console.error('Error creating newsletter draft:', newsletterError);
      // Non-critical error, continue
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        company_id: company.id,
        total_contacts: contacts.length,
        failed_contacts: failedContacts,
        status: failedContacts > 0 ? 'partial' : 'success',
        newsletter_id: newsletter?.id,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error('Onboarding error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
