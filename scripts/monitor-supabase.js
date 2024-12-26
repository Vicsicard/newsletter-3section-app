const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let lastCheckedTime = new Date();

async function monitorNewsletters() {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .gt('created_at', lastCheckedTime.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching newsletters:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('\nNew newsletters detected:');
      console.log('=======================');
      data.forEach(newsletter => {
        console.log(`\nID: ${newsletter.id}`);
        console.log(`Status: ${newsletter.status}`);
        console.log(`Created: ${new Date(newsletter.created_at).toLocaleString()}`);
        console.log(`Content length: ${newsletter.content?.length || 0} characters`);
        lastCheckedTime = new Date(newsletter.created_at);
      });
    }
  } catch (error) {
    console.error('Error in monitoring:', error);
  }
}

console.log('Starting Supabase monitoring...');
console.log(`Initial timestamp: ${lastCheckedTime.toLocaleString()}`);

// Check every 5 seconds
setInterval(monitorNewsletters, 5000);
