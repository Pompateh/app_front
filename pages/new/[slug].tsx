import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Post } from '../../types/post';

interface AdditionalSection {
  title: string;
  paragraph: string;
}

const PostPage: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(true);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-7">
            {/* Left Half */}
            <div className="flex flex-col space-y-4 mt-20 md:ml-[-40px] md:col-span-3 pr-12">
              <div className="text-sm text-gray-500">
                Bảng-tin / {post.type} / {post.title}
              </div>
              <h2 className="text-2xl font-semibold">{post.type}</h2>
              <h1 className="text-2xl font-semibold">{post.title}</h1>
              {post.author && (
                <p className="text-gray-700">
                  <span className="font-semibold">BY {post.author.name}</span>
                  {post.author.jobTitle && (
                    <>
                      <br />
                      {post.author.jobTitle}
                    </>
                  )}
                </p>
              )}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center space-x-1">
                      <span>⏰</span>
                      <span>{post.readingTime}</span>
                    </div>
                  )}
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
                  borderImage:
                    'repeating-linear-gradient(to right, #999380, #999380 50px, transparent 50px, transparent 55px) 1',
                }}
              />
              <div className="prose max-w-none">
                <div
                  className="prose max-w-none mt-6 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Famous Quote */}
                {post.quote && (
                  <div className="mt-4 p-4" style={{ backgroundColor: 'rgb(238, 235, 221)' }}>
                    <blockquote className="italic text-gray-600">
                      &quot;{post.quote}&quot;
                    </blockquote>
                    {post.quoteAuthor && (
                      <div className="text-right text-gray-600 font-semibold">
                        - {post.quoteAuthor}
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Content Sections */}
                {post.additionalContent && post.additionalContent.length > 0 && (
                  <div className="mt-4 mt-8 mb-8">
                    {post.additionalContent.map((section: AdditionalSection, idx: number) => (
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

            {/* Right Half */}
            <div className="flex flex-col space-y-8 mt-4 md:col-span-4 border-l-2 border-[#999380] ml-0">
              <div className="flex flex-row justify-end items-start space-x-4 relative">
                <div className="p-4 mt-24 relative" style={{ width: '29%' }}>
                  {post.contentSources && post.contentSources.length > 0 && (
                    <ol className="list-decimal pl-5 space-y-1">
                      {post.contentSources.map((source: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 break-words">
                          {source}
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="mt-72">
                    <div
                      className="w-full p-4 flex flex-col items-center border-t border-b border-gray-500"
                      style={{ backgroundColor: '#eeebdd' }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold font-bebas">SUBSCRIBE TO OUR</span>
                          <span className="text-xs font-bold font-bebas">NEWSLETTER FOR</span>
                          <span className="text-xs font-bold font-bebas">DAILY GOODNESS</span>
                        </div>
                        <span className="text-5xl font-light flex items-center" style={{ marginTop: '-10px' }}>+</span>
                      </div>
                      <div className="flex justify-end w-full">
                        <Image 
                          src="/assets/Layer 6.png" 
                          alt="Newsletter Doodle" 
                          width={96}
                          height={96}
                          className="w-24 h-24 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference Picture Section */}
                {post.referencePicUrl && isImageExpanded && (
                  <div className="relative w-4/6 bg-black px-16 py-32 rounded shadow overflow-hidden flex flex-col items-center justify-center" style={{ height: '100%' }}>
                    <Image
                      src={post.referencePicUrl}
                      alt={post.referencePicName || 'Reference image'}
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain transition-all duration-300"
                    />
                    {post.referencePicName && (
                      <div className="w-full text-right">
                        <span className="text-xs text-white">{post.referencePicName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostPage;