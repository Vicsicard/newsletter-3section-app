import { useRouter } from 'next/router';
import type { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from '@supabase/supabase-js';

type Newsletter = {
  id: string;
  company_id: string;
  content: string;
  status: string;
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NewsletterView({ newsletter }: { newsletter: Newsletter | null }) {
  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
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
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.id || typeof params.id !== 'string') {
      throw new Error('Invalid newsletter ID');
    }

    const { data: newsletter, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!newsletter) {
      return { notFound: true };
    }

    // Ensure dates are serialized as strings
    const serializedNewsletter = {
      ...newsletter,
      created_at: newsletter.created_at.toString(),
    };

    return {
      props: {
        newsletter: serializedNewsletter,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
    // For build-time errors, we want to fail the build
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    // For development, we want to show a nice error page
    return { notFound: true };
  }
};
