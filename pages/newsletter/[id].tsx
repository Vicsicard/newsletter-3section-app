import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-browser';

interface Newsletter {
  id: string;
  company_id: string;
  content: string;
  status: string;
  created_at: string;
}

export default function NewsletterView() {
  const router = useRouter();
  const { id } = router.query;
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsletter() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('newsletters')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setNewsletter(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsletter();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl text-gray-600">Loading newsletter...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl text-red-600">Error: {error}</div>
    </div>
  );

  if (!newsletter) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl text-gray-600">Newsletter not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="prose prose-lg max-w-none" 
                 dangerouslySetInnerHTML={{ __html: newsletter.content }} />
          </div>
        </div>
      </div>
    </div>
  );
}
