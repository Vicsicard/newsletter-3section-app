import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('newsletters')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'No newsletters found' });
    }

    res.status(200).json({ id: data.id });
  } catch (error: any) {
    console.error('Error fetching latest newsletter:', error);
    res.status(500).json({ error: error.message });
  }
}
