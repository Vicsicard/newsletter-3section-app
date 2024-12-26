import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabaseServer } from '@/utils/supabase-server';
import { GetStaticProps, GetStaticPaths } from 'next';

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

export default function NewsletterView({ newsletter: initialNewsletter, error: initialError }: Props) {
  const router = useRouter();
  const [newsletter] = useState<Newsletter | null>(initialNewsletter);
  const [error] = useState<string | null>(initialError || null);

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
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
  // Return an empty array for paths - Next.js will generate pages on-demand
  return {
    paths: [],
    fallback: true // Enable on-demand page generation
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params?.id) {
    return {
      notFound: true
    };
  }

  try {
    const { data, error } = await supabaseServer
      .from('newsletters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    // Ensure the data is serializable
    const newsletter = {
      ...data,
      created_at: data.created_at.toString()
    };

    return {
      props: {
        newsletter,
      },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error: any) {
    console.error('Error fetching newsletter:', error);
    return {
      props: {
        newsletter: null,
        error: error.message
      }
    };
  }
}
