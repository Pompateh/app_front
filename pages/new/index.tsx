import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Post } from '../../types/post';
import { supabase } from '../../lib/supabaseClient';
import { GetServerSideProps } from 'next';

interface NewsListingProps {
  posts: Post[];
  error?: string;
      }

const NewsListing: React.FC<NewsListingProps> = ({ posts, error }) => {
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">Error: {error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
            <p className="text-lg text-gray-600">Stay updated with our latest stories and updates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/new/${post.slug}`} key={post._id} className="group">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-48">
                    <Image
                      src={post.thumbnail || '/assets/placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      props: {
        posts: data || [],
      },
    };
  } catch (err) {
    return {
      props: {
        posts: [],
        error: err instanceof Error ? err.message : 'An error occurred',
      },
    };
  }
};

export default NewsListing;
