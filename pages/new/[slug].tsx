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
      <div className="min-h-screen w-full">
        <div className="container relative mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Left Half: Main Content */}
            <div className="w-full lg:w-[45%] px-4 lg:pl-60 lg:pr-12 pt-16 lg:pt-20">
              <div className="space-y-4">
                <div className="text-sm text-gray-500 font-crimson-pro">
                  Bảng-tin / {post.type} / {post.title}
                </div>
                <h2 className="text-xl md:text-2xl font-crimson-pro">{post.type}</h2>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-crimson-pro">{post.title}</h1>
                <p className="text-gray-700 font-crimson-pro">
                  <span className="font-semibold">BY {post.authorName}</span> <br />
                  {post.authorJobTitle}
                </p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 space-y-4 sm:space-y-0">
                  <div className="flex items-center text-sm text-gray-600 space-x-4 font-crimson-pro">
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
                    <button className="font-gothic-a1 flex items-center text-blue-500 hover:text-blue-700 text-sm space-x-1">
                      <span>❤️</span>
                      <span>THÍCH</span>
                    </button>
                    <button className="font-gothic-a1 flex items-center text-green-500 hover:text-green-700 text-sm space-x-1">
                      <span>🔗</span>
                      <span>CHIA SẺ</span>
                    </button>
                  </div>
                </div>
                <hr className="border-[#999380] border-t-2" style={{
                  borderImage: 'repeating-linear-gradient(to right, #999380, #999380 50px, transparent 50px, transparent 55px) 1',
                }} />
                <div className="prose max-w-none">
                  <div className="font-crimson-pro text-base md:text-lg space-y-6">
                    {post.content && (
                      <div
                        className="prose max-w-none mt-6 text-gray-800"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    )}
                    {post.quote && (
                      <div className="mt-4 p-4 bg-[#eeebdd]">
                        <blockquote className="italic text-gray-600">
                          "{post.quote}"
                        </blockquote>
                        <div className="text-right text-gray-600 font-semibold">
                          - {post.quoteAuthor}
                        </div>
                      </div>
                    )}
                    {post.additionalContent && (
                      <div className="mt-4 mb-8 space-y-6">
                        {post.additionalContent.map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-xl md:text-2xl font-crimson-pro mb-3">{section.title}</h3>
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
              </div>
            </div>

            {/* Vertical Line - Always visible */}
            <div className="hidden lg:block w-px bg-[#999380] absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2" />

            {/* Right Half: Extra Info */}
            <div className="w-full lg:w-[55%] px-4 lg:pl-12 lg:pr-8 pt-8 lg:pt-20">
              <div className="flex flex-col lg:flex-row justify-end items-start space-y-8 lg:space-y-0 lg:space-x-4">
                <div className="w-full lg:w-[29%]">
                  {post.referencePicUrl && (
                    <button
                      onClick={() => setIsImageVisible(!isImageVisible)}
                      className="font-gothic-a1 absolute top-[-30px] right-0 bg-white bg-opacity-75 px-2 py-1 text-xs hover:bg-opacity-100 transition font-extrabold"
                      style={{ zIndex: 10 }}
                    >
                      {isImageVisible ? 'Hide' : 'Expand'}
                    </button>
                  )}
                  <ol className="list-decimal pl-5 space-y-1">
                    {post.contentSources?.map((source, idx) => (
                      <li key={idx} className="text-sm text-gray-700 break-words font-crimson-pro">
                        {source}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-72">
                    <div className="w-full p-4 flex flex-col items-center border-t border-b border-gray-500 bg-[#eeebdd] opacity-30 pointer-events-none">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold font-gothic-a1">SUBSCRIBE TO OUR</span>
                          <span className="text-xs font-bold font-gothic-a1">NEWSLETTER FOR</span>
                          <span className="text-xs font-bold font-gothic-a1">DAILY GOODNESS</span>
                        </div>
                        <span className="text-5xl font-light flex items-center -mt-2">+</span>
                      </div>
                      <div className="flex justify-end w-full">
                        <img src="/assets/Layer 6.png" alt="Doodle" className="w-24 h-24 mt-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {post.referencePicUrl && isImageVisible && (
                  <div className="w-full lg:w-[71%] bg-black p-4 md:p-8 lg:p-16 rounded shadow">
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={post.referencePicUrl}
                        alt={post.referencePicName}
                        className="max-w-full max-h-full object-contain transition-all duration-300"
                      />
                      <div className="w-full text-right mt-2">
                        <span className="text-xs text-white font-crimson-pro">{post.referencePicName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Posts Section */}
      <div className="w-full bg-[#eeebdd] border-t-2 border-[#999380] mt-12">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
          <h2 className="text-2xl md:text-3xl font-crimson-pro mb-6">Relevant Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relevantPosts.map((relevantPost) => (
              <Link key={relevantPost.id} href={`/new/${relevantPost.slug}`}>
                <div className="group cursor-pointer transition-all duration-300">
                  {relevantPost.featuredImage && (
                    <div className="aspect-square overflow-hidden mb-4">
                      <img
                        src={relevantPost.featuredImage}
                        alt={relevantPost.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 font-crimson-pro mb-2">{relevantPost.type}</p>
                  <h3 className="text-xl md:text-2xl font-crimson-pro mb-2">{relevantPost.title}</h3>
                  {relevantPost.summary && (
                    <p className="text-base text-gray-700 font-crimson-pro">{relevantPost.summary}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
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