import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '@/utils/supabase';
import { parseCSV } from '@/utils/csv';
import fs from 'fs/promises';
import type { OnboardingResponse } from '@/types/form';
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
      maxFileSize: 5 * 1024 * 1024, // 5MB for logo
      multiples: true,
      filter: (part: formidable.Part) => {
        // Allow CSV files and images
        if (part.mimetype?.includes('csv')) return true;
        if (part.name === 'logo_file') {
          return ['image/jpeg', 'image/png', 'image/gif'].includes(part.mimetype || '');
        }
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

    // Handle logo upload if present
    let logoUrl = null;
    const logoFiles = files.logo_file;
    if (logoFiles && Array.isArray(logoFiles) && logoFiles.length > 0) {
      try {
        const logoFile = logoFiles[0];
        
        // Upload logo to Supabase Storage
        const logoBuffer = await fs.readFile(logoFile.filepath);
        const logoFileName = `${Date.now()}-${logoFile.originalFilename}`;
        
        const { data: logoData, error: logoError } = await supabaseAdmin
          .storage
          .from('company-logos')
          .upload(logoFileName, logoBuffer, {
            contentType: logoFile.mimetype || 'image/jpeg',
            upsert: false
          });

        if (logoError) {
          console.error('Logo upload error:', logoError);
          // Don't throw error, just continue without logo
        } else {
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('company-logos')
            .getPublicUrl(logoFileName);

          logoUrl = publicUrl;
        }
      } catch (error) {
        console.error('Logo upload error:', error);
        // Don't throw error, just continue without logo
      }
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
          logo_url: logoUrl,
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
    await Promise.all([
      fs.unlink(csvFile.filepath),
      ...(logoFiles && Array.isArray(logoFiles) ? logoFiles.map(f => fs.unlink(f.filepath)) : []),
    ]);

    // Generate newsletter content
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/generate-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      if (!response.ok) {
        console.error('Newsletter generation failed:', await response.text());
        throw new Error('Failed to generate newsletter');
      }
    } catch (error) {
      console.error('Error generating newsletter:', error);
      throw new Error('Failed to generate newsletter');
    }

    const successfulContacts = contacts.length - failedContacts;
    res.status(200).json({
      success: true,
      message: `Successfully created company and imported ${successfulContacts} contacts${
        failedContacts > 0 ? ` (${failedContacts} failed)` : ''
      }. Newsletter generation started.`,
      data: {
        id: company.id,
        company_name: company.company_name,
        logo_url: company.logo_url,
        website_url: company.website_url,
        contact_email: company.contact_email,
        phone_number: company.phone_number,
        industry: company.industry,
        target_audience: company.target_audience,
        contacts_count: successfulContacts,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
      });
    }
  }
}
