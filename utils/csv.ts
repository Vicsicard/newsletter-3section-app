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
          email: record.email.trim().toLowerCase(),
          first_name: record.first_name || '',
          last_name: record.last_name || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
