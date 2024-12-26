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
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024,
      multiples: true,
      filter: (part: formidable.Part) => {
        return part.mimetype?.includes('csv') || false;
      },
    });
    
    // Parse form data with Promise
    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files) => {
        if (err) {
          reject(new ApiError(400, `File upload error: ${err.message}`));
        } else {
          resolve([fields, files]);
        }
      });
    });

    // Validate required fields
    const companyName = fields.company_name?.toString();
    const websiteUrl = fields.website_url?.toString();
    const contactEmail = fields.contact_email?.toString();
    const phoneNumber = fields.phone_number?.toString();
    const industry = fields.industry?.toString();
    const targetAudience = fields.target_audience?.toString();

    if (!companyName || !contactEmail || !industry || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate files
    const csvFiles = files.contact_list;
    if (!csvFiles || !Array.isArray(csvFiles) || csvFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact list CSV is required',
      });
    }

    const csvFile = csvFiles[0];
    if (!csvFile.originalFilename?.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file',
      });
    }

    // Process company creation
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

    if (companyError || !company) {
      return res.status(500).json({
        success: false,
        message: `Failed to create company: ${companyError?.message || 'Unknown error'}`,
      });
    }

    // Process CSV file
    const fileContent = await fs.readFile(csvFile.filepath, 'utf-8');
    let contacts: any[] = [];
    try {
      contacts = await parseCSV(fileContent);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse CSV file. Ensure it contains only Name and Email columns.',
      });
    }

    // Insert contacts
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
        failedContacts += batch.length;
      }
    }

    // Clean up file
    await fs.unlink(csvFile.filepath);

    // Generate newsletter
    try {
      const newsletterResponse = await fetch(`${process.env.BASE_URL || ''}/api/generate-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id }),
      });

      const newsletterData = await newsletterResponse.json();

      if (!newsletterResponse.ok) {
        console.error('Newsletter generation failed:', newsletterData);
        return res.status(200).json({
          success: true,
          message: `Company created and contacts imported. Newsletter generation failed: ${newsletterData.message || 'Unknown error'}`,
          company: {
            id: company.id,
            company_name: company.company_name,
            website_url: company.website_url,
            contact_email: company.contact_email,
            phone_number: company.phone_number,
            industry: company.industry,
            target_audience: company.target_audience,
            audience_description: company.audience_description || '',
            newsletter_objectives: company.newsletter_objectives || '',
            primary_cta: company.primary_cta || '',
            contacts_count: contacts.length - failedContacts,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Successfully created company and imported ${contacts.length - failedContacts} contacts${
          failedContacts > 0 ? ` (${failedContacts} failed)` : ''
        }. Newsletter generation started.`,
        company: {
          id: company.id,
          company_name: company.company_name,
          website_url: company.website_url,
          contact_email: company.contact_email,
          phone_number: company.phone_number,
          industry: company.industry,
          target_audience: company.target_audience,
          audience_description: company.audience_description || '',
          newsletter_objectives: company.newsletter_objectives || '',
          primary_cta: company.primary_cta || '',
          contacts_count: contacts.length - failedContacts,
        },
      });
    } catch (error) {
      // If newsletter generation fails, still return success for company creation
      console.error('Newsletter generation error:', error);
      return res.status(200).json({
        success: true,
        message: `Company created and contacts imported. Newsletter generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        company: {
          id: company.id,
          company_name: company.company_name,
          website_url: company.website_url,
          contact_email: company.contact_email,
          phone_number: company.phone_number,
          industry: company.industry,
          target_audience: company.target_audience,
          audience_description: company.audience_description || '',
          newsletter_objectives: company.newsletter_objectives || '',
          primary_cta: company.primary_cta || '',
          contacts_count: contacts.length - failedContacts,
        },
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(error instanceof ApiError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
}
