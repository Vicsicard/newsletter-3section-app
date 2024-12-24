import { parse } from 'csv-parse';

interface Contact {
  name: string;
  email: string;
}

export async function parseCSV(fileBuffer: Buffer): Promise<Contact[]> {
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
          name: record.name || '',
          email: record.email.toLowerCase(),
        });
      }
    });

    parser.on('error', function(err) {
      reject(new Error('Error parsing CSV: ' + err.message));
    });

    parser.on('end', function() {
      if (contacts.length === 0) {
        reject(new Error('No valid contacts found in CSV'));
      } else {
        resolve(contacts);
      }
    });

    parser.write(fileBuffer);
    parser.end();
  });
}
