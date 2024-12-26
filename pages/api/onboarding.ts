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
      filter: (part) => {
        // Only process CSV files if they exist
        return part.name === 'contact_list' ? part.originalFilename?.toLowerCase().endsWith('.csv') || false : true;
      },
    });

    // Parse form data
    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files) => {
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

    // Set headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    // Validate required fields
    const companyName = fields.company_name?.toString();
    const websiteUrl = fields.website_url?.toString();
    const contactEmail = fields.contact_email?.toString();
    const phoneNumber = fields.phone_number?.toString();
    const industry = fields.industry?.toString();
    const targetAudience = fields.target_audience?.toString();

    console.log('Received fields:', {
      companyName,
      websiteUrl,
      contactEmail,
      phoneNumber,
      industry,
      targetAudience,
      files: Object.keys(files)
    });

    // For testing, only require company name and email
    if (!companyName || !contactEmail) {
      responseData.message = 'Company name and contact email are required';
      return res.status(400).json(responseData);
    }

    // Process CSV file
    console.log('Processing CSV file...');
    const csvFiles = files.contact_list;
    let contacts: any[] = [];

    if (csvFiles && Array.isArray(csvFiles) && csvFiles.length > 0) {
      const csvFile = csvFiles[0];
      if (csvFile.originalFilename?.toLowerCase().endsWith('.csv')) {
        try {
          console.log('Reading CSV file:', csvFile.originalFilename);
          const csvContent = await fs.readFile(csvFile.filepath, 'utf-8');
          contacts = await parseCSV(csvContent);
          console.log(`Parsed ${contacts.length} contacts from CSV`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          throw new Error('Failed to parse CSV file');
        }
      }
    } else {
      console.log('No CSV file uploaded, skipping contact import');
    }

    // Create company in Supabase
    console.log('Creating company in Supabase...');
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id, version')
      .eq('contact_email', contactEmail)
      .order('version', { ascending: false })
      .limit(1)
      .single();

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

    if (companyError) {
      console.error('Supabase Error:', {
        message: companyError.message,
        details: companyError.details,
        hint: companyError.hint,
        code: companyError.code
      });
      throw new Error(`Failed to create company: ${companyError.message}`);
    }

    if (!company) {
      throw new Error('Company created but not returned from Supabase');
    }

    console.log('Company created:', company);

    // Insert contacts
    console.log('Importing contacts to Supabase...');
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
        console.error('Contact import error:', contactsError);
        failedContacts += batch.length;
      }
    }

    console.log(`Successfully imported ${contacts.length - failedContacts} contacts`);

    // Clean up file
    if (csvFiles && Array.isArray(csvFiles) && csvFiles.length > 0) {
      const csvFile = csvFiles[0];
      await fs.unlink(csvFile.filepath);
    }

    // Generate and store newsletter
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Generating newsletter content...');
        
        // Generate content first
        const content = await generateNewsletterContent({
          companyName: company.company_name,
          industry: company.industry || '',
          targetAudience: company.target_audience || ''
        });

        console.log('Content generated, creating newsletter record...');

        // Create newsletter with generated content
        const { data: newsletter, error: newsletterError } = await supabaseAdmin
          .from('newsletters')
          .insert([
            {
              company_id: company.id,
              title: `${company.company_name} Newsletter`,
              status: 'draft',
              content: content.content, // Using 'content' instead of 'newsletter_content'
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (newsletterError) {
          console.error('Newsletter creation error:', {
            error: newsletterError,
            message: newsletterError.message,
            details: newsletterError.details,
            hint: newsletterError.hint,
            code: newsletterError.code
          });
          throw new Error(`Failed to create newsletter: ${newsletterError.message}`);
        }

        if (!newsletter) {
          throw new Error('Newsletter created but not returned from Supabase');
        }

        console.log('Newsletter created successfully:', newsletter);
        
        responseData.success = true;
        responseData.message = 'Company created, contacts imported, and newsletter generated successfully';
        responseData.company = company;
        return res.status(200).json(responseData);
      } catch (error) {
        console.error('Newsletter generation error:', error);
        responseData.success = true; // Still true because company and contacts were successful
        responseData.message = `Company created and contacts imported. Newsletter generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        responseData.company = company;
        return res.status(200).json(responseData);
      }
    } else {
      console.log('Skipping newsletter generation - OpenAI API key not set');
      responseData.success = true;
      responseData.message = 'Company created and contacts imported. Skipped newsletter generation (OpenAI API key not set)';
      responseData.company = company;
      return res.status(200).json(responseData);
    }

  } catch (error) {
    console.error('API error:', error);
    responseData.message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return res.status(500).json(responseData);
  }
}

async function testSupabaseConnection() {
  try {
    const { error } = await supabaseAdmin.from('companies').select('id').limit(1);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}
