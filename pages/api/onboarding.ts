import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabase } from '../../utils/supabase';
import { parseCSV } from '../../utils/csv';
import fs from 'fs/promises';
import type { OnboardingResponse } from '../../types';

// Disable body parsing, we'll handle the form data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OnboardingResponse>
) {
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('Starting onboarding process...');

    // Parse the multipart form data
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      console.log('Parsing form data...');
      const form = formidable({
        multiples: true, // Enable multiple values for the same field name
      });
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        console.log('Form fields received:', fields);
        console.log('Files received:', Object.keys(files));
        resolve({ fields, files });
      });
    });

    // Validate required fields
    const requiredFields = ['company_name', 'contact_email', 'industry', 'audience_description', 'primary_cta'];
    const missingFields = requiredFields.filter(field => !fields[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.contact_email)) {
      console.log('Invalid email format:', fields.contact_email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate CSV file
    const csvFile = files.contact_list;
    if (!csvFile) {
      console.log('Missing CSV file');
      return res.status(400).json({
        success: false,
        error: 'Missing contact list CSV'
      });
    }

    // Handle newsletter objectives (can be single value or array)
    let newsletterObjectives = fields.newsletter_objectives;
    if (!Array.isArray(newsletterObjectives)) {
      newsletterObjectives = newsletterObjectives ? [newsletterObjectives] : [];
    }
    console.log('Newsletter objectives:', newsletterObjectives);

    const companyData = {
      company_name: fields.company_name,
      website_url: fields.website_url,
      contact_email: fields.contact_email,
      phone_number: fields.phone_number,
      industry: fields.industry,
      audience_description: fields.audience_description,
      newsletter_objectives: newsletterObjectives,
      primary_cta: fields.primary_cta
    };
    console.log('Creating company with data:', companyData);

    // Create company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      if (companyError.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          error: 'A company with this email already exists'
        });
      }
      return res.status(500).json({
        success: false,
        error: `Error creating company record: ${companyError.message}`
      });
    }

    console.log('Company created successfully:', company);

    // Create CSV upload record
    const { data: csvUpload, error: csvUploadError } = await supabase
      .from('csv_uploads')
      .insert({
        company_id: company.id,
        filename: csvFile.originalFilename,
        status: 'processing',
      })
      .select()
      .single();

    if (csvUploadError) {
      console.error('Error creating CSV upload record:', csvUploadError);
      return res.status(500).json({
        success: false,
        error: `Error tracking CSV upload: ${csvUploadError.message}`
      });
    }

    console.log('CSV upload record created:', csvUpload);

    // Read and parse CSV file
    let contacts;
    try {
      console.log('Reading CSV file:', csvFile.filepath);
      const fileBuffer = await fs.readFile(csvFile.filepath);
      contacts = await parseCSV(fileBuffer);
      
      if (contacts.length === 0) {
        throw new Error('No valid contacts found in CSV');
      }

      console.log(`Parsed ${contacts.length} contacts from CSV`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      await supabase
        .from('csv_uploads')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', csvUpload.id);

      return res.status(400).json({
        success: false,
        error: 'Error parsing CSV file: ' + error.message
      });
    }

    // Insert contacts in batches
    const batchSize = 100;
    let failedContacts = 0;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize).map(contact => ({
        company_id: company.id,
        csv_batch_id: csvUpload.id,
        name: contact.name,
        email: contact.email
      }));

      console.log(`Inserting batch ${i / batchSize + 1} of contacts...`);
      const { error: contactsError } = await supabase
        .from('contacts')
        .insert(batch);

      if (contactsError) {
        console.error('Error inserting contacts batch:', contactsError);
        failedContacts += batch.length;
      }
    }

    // Update CSV upload status
    const csvStatus = failedContacts === contacts.length ? 'failed' : 'completed';
    console.log(`Updating CSV upload status to ${csvStatus}`);
    
    await supabase
      .from('csv_uploads')
      .update({
        status: csvStatus,
        processed_count: contacts.length - failedContacts,
        error_message: failedContacts > 0 ? `Failed to insert ${failedContacts} contacts` : null,
      })
      .eq('id', csvUpload.id);

    // Create initial newsletter draft
    console.log('Creating initial newsletter draft...');
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .insert({
        company_id: company.id,
        title: `${fields.company_name} Newsletter Draft`,
        status: 'draft',
      })
      .select()
      .single();

    if (newsletterError) {
      console.error('Error creating newsletter draft:', newsletterError);
      return res.status(500).json({
        success: false,
        error: `Error creating newsletter draft: ${newsletterError.message}`
      });
    }

    console.log('Newsletter draft created:', newsletter);

    // Clean up the temporary file
    try {
      await fs.unlink(csvFile.filepath);
      console.log('Temporary CSV file cleaned up');
    } catch (error) {
      console.error('Error cleaning up temporary file:', error);
    }

    // Return success response with created records
    console.log('Onboarding process completed successfully');
    return res.status(200).json({
      success: true,
      data: {
        company,
        newsletter,
        contacts_processed: contacts.length - failedContacts,
      },
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
