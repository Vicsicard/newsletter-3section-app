import { useRouter } from 'next/router';
import type { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from '@supabase/supabase-js';

type Newsletter = {
  id: string;
  company_id: string;
  content: string;
  status: string;
  created_at: string;
}

export default function NewsletterView({
  newsletter,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading newsletter...</div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Newsletter Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The newsletter you're looking for might have been removed or is temporarily unavailable.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: newsletter.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Don't pre-render any paths
    fallback: true, // Enable on-demand generation
  };
};

export const getStaticProps = (async ({ params }) => {
  try {
    if (!params?.id) {
      return { notFound: true };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return { notFound: true };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: newsletter, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { notFound: true };
    }

    if (!newsletter) {
      return { notFound: true };
    }

    return {
      props: {
        newsletter: {
          ...newsletter,
          created_at: new Date(newsletter.created_at).toISOString(),
        },
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
}) satisfies GetStaticProps<{
  newsletter: Newsletter | null;
}>;
