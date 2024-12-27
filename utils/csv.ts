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

        // Split name into first_name and last_name if only name is provided
        let firstName = record.first_name || '';
        let lastName = record.last_name || '';
        
        if (!firstName && !lastName && record.name) {
          const nameParts = record.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        contacts.push({
          email: record.email.trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
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
