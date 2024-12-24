import { parse } from 'csv-parse';
import type { Contact } from '@/types';

export async function parseCSV(input: string | Buffer): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    const contacts: Contact[] = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        // Validate required email field
        if (!record.email || !record.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          continue; // Skip invalid records
        }

        contacts.push({
          email: record.email,
          name: record.name || '',
          company_id: '', // This will be set by the API
          created_at: new Date().toISOString(),
          id: '', // This will be set by Supabase
        });
      }
    });

    parser.on('error', function(err) {
      reject(err);
    });

    parser.on('end', function() {
      resolve(contacts);
    });

    // Handle the input
    if (Buffer.isBuffer(input)) {
      parser.write(input);
    } else {
      parser.write(Buffer.from(input));
    }
    parser.end();
  });
}
