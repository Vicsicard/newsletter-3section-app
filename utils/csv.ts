import { parse } from 'csv-parse/sync';
import { Contact } from '@/types';

export async function parseCSV(csvContent: string): Promise<Partial<Contact>[]> {
  try {
    console.log('Raw CSV content:', csvContent);
    
    // Remove any BOM characters and trim whitespace
    const cleanContent = csvContent.trim().replace(/^\uFEFF/, '');
    
    // Parse CSV with specific options
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true
    });

    console.log('Parsed records:', records);

    return records.map((record: any) => {
      // Handle both name field and separate first/last name fields
      let firstName = record.first_name || '';
      let lastName = record.last_name || '';
      
      if (!firstName && !lastName && record.name) {
        const nameParts = record.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Validate email
      const email = record.email?.trim().toLowerCase();
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.warn('Skipping record with invalid email:', record);
        return null;
      }

      return {
        email,
        first_name: firstName,
        last_name: lastName,
        is_active: true
      };
    }).filter(Boolean); // Remove null entries
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
