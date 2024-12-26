import { useRouter } from 'next/router';
import { GetStaticProps, GetStaticPaths } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Newsletter {
  id: string;
  company_id: string;
  content: string;
  status: string;
  created_at: string;
}

interface Props {
  newsletter: Newsletter | null;
  error?: string;
}

// Create a Supabase client for static generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default function NewsletterView({ newsletter, error }: Props) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading newsletter...</div>
      </div>
    );
  }

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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Don't pre-render any paths
    fallback: 'blocking' // Block until the page is generated
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.id) {
      return { notFound: true };
    }

    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        props: {
          newsletter: null,
          error: 'Failed to fetch newsletter'
        }
      };
    }

    if (!data) {
      return { notFound: true };
    }

    // Ensure all date fields are converted to strings
    const newsletter = {
      ...data,
      created_at: new Date(data.created_at).toISOString()
    };

    return {
      props: {
        newsletter,
        error: null
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        newsletter: null,
        error: 'An unexpected error occurred'
      }
    };
  }
};
