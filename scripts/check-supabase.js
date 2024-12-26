const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching newsletters:', error);
    return;
  }

  console.log('\nLatest newsletters:');
  console.log('==================');
  data.forEach(newsletter => {
    console.log(`\nID: ${newsletter.id}`);
    console.log(`Status: ${newsletter.status}`);
    console.log(`Created: ${new Date(newsletter.created_at).toLocaleString()}`);
    console.log(`Content length: ${newsletter.content?.length || 0} characters`);
  });
}

checkNewsletters();
