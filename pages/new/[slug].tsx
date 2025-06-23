import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';
import VerticalLine from '../../components/VerticalLine';

interface Post {
  id: string;
  createdAt: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  published: boolean;
  publishedAt: string | null;
  content: string;
  referencePicUrl: string;
  referencePicName: string;
  authorName: string;
  authorJobTitle: string;
  postDate: string | null;
  readingTime: string;
  contentSources: string[];
  additionalContent: { title: string; paragraph: string }[];
  quote: string;
  quoteAuthor: string;
  type: string;
}

interface AdditionalSection {
  title: string;
  paragraph: string;
}

interface PostPageProps {
  post: Post | null;
  error?: string;
}

const PostPage: React.FC<PostPageProps> = ({ post, error }) => {
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [relevantPosts, setRelevantPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchRelevantPosts = async () => {
      if (!post) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', post.id) // Exclude the current post
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching relevant posts:', error);
        return;
      }
      
      if (data) {
        // Map snake_case to camelCase for each post
        const toCamel = (s: string) => s.replace(/([-_][a-z])/g, g => g[1].toUpperCase());
        const camelCasePosts = data.map(p => {
            const camelPost: any = {};
            for (const key in p) {
                camelPost[toCamel(key)] = p[key];
            }
            return camelPost as Post;
        });
        setRelevantPosts(camelCasePosts);
      }
    };

    fetchRelevantPosts();
  }, [post]);

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">Error: {error || 'Post not found'}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Layout>
      <VerticalLine />
      <div className="w-full" style={{ paddingLeft: '238px', marginRight: '0',  }}>
        <div className="grid grid-cols-1 md:grid-cols-7">
          {/* Left Half: Main Content */}
          <div className="flex flex-col space-y-4 mt-20 md:ml-[-40px] md:col-span-3 pr-6">
            <div className="text-sm text-gray-500">
              Bảng-tin / {post.type} / {post.title}
            </div>
            <h2 className="text-2xl font-semibold">{post.type}</h2>
            <h1 className="text-2xl font-semibold">{post.title}</h1>
            <p className="text-gray-700">
              <span className="font-semibold">BY {post.authorName}</span> <br />
              {post.authorJobTitle}
            </p>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{new Date(post.postDate || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="font-bebas flex items-center text-blue-500 hover:text-blue-700 text-sm space-x-1">
                  <span>❤️</span>
                  <span>THÍCH</span>
                </button>
                <button className="font-bebas flex items-center text-green-500 hover:text-green-700 text-sm space-x-1">
                  <span>🔗</span>
                  <span>CHIA SẺ</span>
                </button>
              </div>
            </div>
            <hr
              className="border-gray-300"
              style={{
                borderTop: '2px solid transparent',
                borderImage: 'repeating-linear-gradient(to right, #999380, #999380 50px, transparent 50px, transparent 55px) 1',
              }}
            />
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold">{post.title}</h2>
                {post.content && (
    <div
      className="prose max-w-none mt-6 text-gray-800"
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
  )}
              {post.quote && (
                <div className="mt-4 p-4" style={{ backgroundColor: 'rgb(238, 235, 221)' }}>
                  <blockquote className="italic text-gray-600">
                    "{post.quote}"
                  </blockquote>
                  <div className="text-right text-gray-600 font-semibold">
                    - {post.quoteAuthor}
                  </div>
                </div>
              )}
                        {post.additionalContent && (
  <div className="mt-4 mb-8" >
    {post.additionalContent.map((section, idx) => (
      <div key={idx}>
        <h3 className="text-xl font-semibold">{section.title}</h3>
        <div
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: section.paragraph }}
        />
      </div>
    ))}
  </div>
)}
            </div>
          </div>
          {/* Right Half: Extra Info */}
          <div className="flex flex-col space-y-8 mt-4 md:col-span-4 border-l-2 border-[#999380] pl-0">
            <div className="flex flex-row justify-end items-start space-x-4 relative">
              <div className="p-4 mt-24 relative" style={{ width: '29%' }}>
                {post.referencePicUrl && (
                  <button
                    onClick={() => setIsImageVisible(!isImageVisible)}
                    className="font-bebas absolute top-[-30px] right-0 bg-white bg-opacity-75 px-2 py-1 text-xs hover:bg-opacity-100 transition font-extrabold"
                    style={{ zIndex: 10 }}
                  >
                    {isImageVisible ? 'Hide' : 'Expand'}
                  </button>
                )}
                <ol className="list-decimal pl-5 space-y-1">
                  {post.contentSources?.map((source, idx) => (
                    <li key={idx} className="text-sm text-gray-700 break-words">
                      {source}
                    </li>
                  ))}
                </ol>
                <div className="mt-72">
                  <div
                    className="w-full p-4 flex flex-col items-center border-t border-b border-gray-500"
                    style={{ backgroundColor: '#eeebdd', opacity: 0.3, pointerEvents: 'none' }}
                    aria-disabled="true"
                  >
                    <div className="flex justify-between items-center w-full ">
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold font-bebas">SUBSCRIBE TO OUR</span>
                        <span className="text-xs font-bold font-bebas">NEWSLETTER FOR</span>
                        <span className="text-xs font-bold font-bebas">DAILY GOODNESS</span>
                      </div>
                      <span className="text-5xl font-light flex items-center" style={{ marginTop: '-10px' }}>+</span>
                    </div>
                    <div className="flex justify-end w-full">
                      <img src="/assets/Layer 6.png" alt="Doodle" className="w-24 h-24 mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              {post.referencePicUrl && isImageVisible && (
                <div className="relative w-3/4 bg-black px-16 py-32 rounded shadow overflow-hidden flex flex-col items-center justify-center" style={{ height: '100%' }}>
                  <img
                    src={post.referencePicUrl}
                    alt={post.referencePicName}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                  />
                  <div className="w-full text-right">
                    <span className="text-xs text-white">{post.referencePicName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Posts Section */}
      <div className="w-1500 p-12 border-t-2 border-[#999380] relevant_post" style={{ backgroundColor: 'rgb(238, 235, 221)' }}>
        <h2 className="text-3xl font-bold mb-4 ml-16 ">Relevant Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-16">
          {relevantPosts.map((relevantPost) => (
            <Link key={relevantPost.id} href={`/new/${relevantPost.slug}`} legacyBehavior>
              <a className="transition cursor-pointer">
                {relevantPost.featuredImage && (
                  <img
                    src={relevantPost.featuredImage}
                    alt={relevantPost.title}
                    className="w-full h-100 object-cover mb-2"
                    style={{ aspectRatio: '1 / 1' }} // Ensures the image is square
                  />
                )}
                <p className="text-sm text-gray-500">{relevantPost.type}</p>
                <h3 className="text-xl font-semibold">{relevantPost.title}</h3>
                {relevantPost.summary && (
                  <p className="text-sm text-gray-700 mt-1">{relevantPost.summary}</p>
                )}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;
  if (!slug) return { notFound: true };

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  // DEBUG: Log the raw post data from Supabase to the terminal
  console.log('Raw data from Supabase:', post);

  if (error || !post) return { notFound: true };

  // Map snake_case to camelCase
  const toCamel = (s: string) => s.replace(/([-_][a-z])/g, g => g[1].toUpperCase());
  const camelPost: any = {};
  for (const key in post) {
    camelPost[toCamel(key)] = post[key];
  }
  // Parse additionalContent if needed
  if (typeof camelPost.additionalContent === 'string' && camelPost.additionalContent) {
    try {
      camelPost.additionalContent = JSON.parse(camelPost.additionalContent);
    } catch (e) {
      console.error('Failed to parse additionalContent:', e);
      camelPost.additionalContent = []; // Default to empty array on parse error
    }
  } else if (!camelPost.additionalContent) {
    camelPost.additionalContent = [];
  }

  return { props: { post: camelPost } };
};

export default PostPage;