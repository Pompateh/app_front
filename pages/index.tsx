import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { NavigationProvider } from '../components/NavigationContext';
import StudioNavigation from '../components/StudioNavigation';
import VerticalLineBlack from '../components/VerticalLine_black';
import Preloader from '../components/Preloader';

interface NavItem {
  label: string;
  href: string;
}

interface Studio {
  id: string;
  name: string;
  description: string;
  author?: string;
  thumbnail?: string;
  imageTitle?: string;
  imageDescription?: string;
  openDays?: string[];
  openHours?: string;
  navigation?: NavItem[];
  logo?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(`https://app-back-gc64.onrender.com${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log('Response Status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error Response:', errorText);
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  const data = await res.json();
  console.log('Fetched Data:', data);
  return data;
};

const MasterHomepage: NextPage = () => {
  const { data, error } = useSWR<Studio[]>('/api/studios', fetcher);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [shouldShowPreloader, setShouldShowPreloader] = useState(true);

  // Check if preloader has been shown before
  useEffect(() => {
    const hasSeenPreloader = localStorage.getItem('hasSeenPreloader');
    if (hasSeenPreloader) {
      setShouldShowPreloader(false);
      setShowContent(true);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (data || error) {
      if (shouldShowPreloader) {
        // Only show preloader for 1.2s if it's the first visit
        timer = setTimeout(() => {
          setLoading(false);
          // Mark that we've seen the preloader
          localStorage.setItem('hasSeenPreloader', 'true');
        }, 1200);
      } else {
        // If not first visit, just set loading to false immediately
        setLoading(false);
      }
    }
    return () => clearTimeout(timer);
  }, [data, error, shouldShowPreloader]);

  useEffect(() => {
    if (data) {
      setStudios(data);
    }
    if (error) {
      toast.error(error.message || 'Failed to load studios');
    }
  }, [data, error]);

  // Handle preloader fade out and content fade in
  useEffect(() => {
    if (!loading) {
      setPreloaderFade(true);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!showContent) {
    return (
      <div className={preloaderFade ? 'preloader-fade-out' : ''}>
        <Preloader />
        <style jsx global>{`
          .preloader-fade-out {
            animation: preloaderFadeOut 0.4s forwards;
          }
          @keyframes preloaderFadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="homepage-fade-in">
      <div className="flex-1 h-screen snap-y snap-mandatory overflow-y-auto">
        <VerticalLineBlack />
        {Array.isArray(studios) && studios.length > 0 ? (
          studios.map((studio) => (
            <section key={studio.id} className="relative h-screen snap-start flex flex-col md:flex-row bg-indigo-900 text-white overflow-hidden">
              {/* Left: Image content */}
              <div className="relative flex-1 overflow-hidden">
                {studio.thumbnail ? (
                  <div className="w-full h-full relative">
                    {studio.thumbnail.match(/\.mp4$/i) ? (
                      <video
                        src={studio.thumbnail}
                        className="w-full h-full object-cover animate-fadeIn"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <img
                        src={studio.thumbnail}
                        alt={studio.name}
                        className="w-full h-full object-cover transform transition-transform duration-1000 ease-in-out hover:scale-105 opacity-0 animate-fadeIn"
                      />
                    )}
                    <div className="absolute inset-0 bg-black opacity-20" style={{ transform: 'translateY(0px)' }} />
                    {(studio.imageTitle || studio.imageDescription || studio.author) && (
                      <div
                        className="absolute bottom-0 left-8 right-4 flex items-center justify-between bg-white animate-fadeIn"
                        style={{ height: '130px', boxSizing: 'border-box' }}
                      >
                        <div className="flex flex-col" style={{ maxWidth: '70%', lineHeight: '1.2', padding: '14px 14px' }}>
                          {studio.imageTitle && (
                            <h2
                              style={{
                                fontFamily: '"Crimson Pro", serif',
                                letterSpacing: '0.05em',
                                margin: '0 0 0.5em 0',
                                fontWeight: 400,
                                fontStyle: 'italic',
                                fontSize: '2rem',
                              }}
                              className="text-black"
                            >
                              {studio.imageTitle}
                            </h2>
                          )}
                          {studio.imageDescription && (
                            <p
                              style={{ 
                                fontSize: '1.125rem', 
                                lineHeight: '1.3', 
                                margin: 0,
                                fontFamily: '"Crimson Pro", serif',
                                fontWeight: 400,
                                fontStyle: 'normal'
                              }}
                              className="text-black"
                            >
                              {studio.imageDescription}
                            </p>
                          )}
                        </div>
                        {studio.author && (
                          <div className="text-black" style={{ fontSize: '0.75rem', fontFamily: 'Gothic A1, sans-serif', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.1, position: 'absolute', right: 12, bottom: 10, padding: '0 8px', background: 'rgba(255,255,255,0.85)', borderRadius: '4px' }}>
                            {studio.author.split('/').map(line => line.trim()).join('\n')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-300 font-gothic-a1">No Image Available</span>
                  </div>
                )}
              </div>
              {/* Right: Studio details and Navigation */}
              <div className="flex-1 flex flex-col bg-[#1a1916] relative">
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div
                    className="relative border border-gray-300 bg-black text-white"
                    style={{ width: '350px', minHeight: '400px', height: 'auto', paddingBottom: '3.5rem' }}
                  >
                    {/* Doodle Stickers Around the Studio Box */}
                    <img src="/assets/inv_sticker10.png" alt="Doodle Behind Box" style={{ position: 'absolute', top: '-60px', left: '-80px', width: '90px', height: '90px', zIndex: 0, transform: 'rotate(-8deg)' }} />
                    <img src="/assets/inv_sticker11.png" alt="Doodle Far Right" style={{ position: 'absolute', top: '60px', right: '-110px', width: '90px', height: '90px', zIndex: 10, transform: 'rotate(12deg)' }} />
                    <img src="/assets/Layer 6.png" alt="Doodle Far Bottom Left" style={{ position: 'absolute', bottom: '-100px', left: '-40px', width: '90px', height: '90px', zIndex: 10, transform: 'rotate(-6deg)' }} />
                    <div className="p-4">
                      <div className="w-full">
                        {studio.logo ? (
                          <div className="flex items-center w-full" style={{ height: '2.5rem', marginBottom: '0.75rem' }}>
                            <img
                              src="/assets/Vector.png"
                              alt={studio.name + ' logo'}
                              className="max-h-10 object-contain"
                              style={{ maxWidth: '100%', maxHeight: '2.5rem' }}
                            />
                          </div>
                        ) : (
                          <h2 
                            className="text-2xl mb-3" 
                            style={{
                              fontFamily: '"Crimson Pro", serif',
                              fontWeight: 400,
                              fontSize: '2rem'
                            }}
                          >
                            {studio.name}
                          </h2>
                        )}
                        <hr className="border-t-2 border-[#999380] mt-2 w-full" />
                      </div>
                    </div>
                    <p
                      className="text-sm px-4 py-2"
                      style={{
                        fontFamily: '"Crimson Pro", serif',
                        fontWeight: 400,
                        fontSize: '1.125rem',
                        lineHeight: 1.2
                      }}
                      dangerouslySetInnerHTML={{
                        __html: studio.description.replace(/\n/g, '<br />')
                      }}
                    />
                    <hr className="micro-divider mt-2" />
                    <div className="py-2">
                      <div className="p-4">
                        <p 
                          className="text-xs uppercase mb-4" 
                          style={{
                            fontFamily: '"Gothic A1", sans-serif',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}
                        >
                          Giờ Mở Cửa
                        </p>
                        <hr className="border-t-2 border-[#999380] mt-2 w-full" />
                      </div>
                      <div className="flex justify-between p-4">
                        <span 
                          className="text-sm" 
                          style={{
                            fontFamily: '"Crimson Pro", serif',
                            fontWeight: 400,
                            fontSize: '1.125rem'
                          }}
                        >
                          {studio.openHours || 'N/A'}
                        </span>
                        <span 
                          className="text-sm" 
                          style={{
                            fontFamily: '"Crimson Pro", serif',
                            fontWeight: 400,
                            fontStyle: 'italic',
                            fontSize: '1.125rem'
                          }}
                        >
                          {studio.openDays && studio.openDays.length > 0 ? studio.openDays.join(', ') : ''}
                        </span>
                      </div>
                    </div>
                    {/* Enter Studio Button */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                      <Link href={`/studio/${studio.id}`}>
                        <button
                          className="w-full bg-yellow-400 text-black py-3 px-4 flex items-center justify-between transition hover:bg-yellow-500 focus:outline-none"
                          style={{
                            fontFamily: '"Gothic A1", "Crimson Pro", sans-serif',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            fontSize: '1.125rem'
                          }}
                        >
                          <span>TỚI STUDIO</span>
                          <span className="text-xl">
                            <img
                              src="https://www.svgrepo.com/show/175121/door-open.svg"
                              alt="Door Icon"
                              className="w-6 h-6"
                            />
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Full-Width Navigation Bar */}
                <div className="w-full">
                  <NavigationProvider key={studio.id}>
                    <StudioNavigation navItems={studio.navigation || [
                      { label: 'Overview', href: `/studio/${studio.id}/overview` },
                      { label: 'Exhibits', href: `/studio/${studio.id}/exhibits` },
                      { label: 'Events', href: `/studio/${studio.id}/events` },
                    ]} />
                  </NavigationProvider>
                </div>
              </div>
            </section>
          ))
        ) : (
          <div className="h-screen flex items-center justify-center bg-indigo-900">
            <div className="text-center">
              <div className="animate-pulse">
              </div>
              <p className="text-indigo-300 text-lg">Loading studios...</p>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .homepage-fade-in {
          opacity: 0;
          animation: homepageFadeIn 0.8s 0.1s forwards;
        }
        @keyframes homepageFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
                  .micro-divider {
content: "";
  position: absolute;
  left: 0;
  right: 0;

  /* Apply the custom dashed pattern using borderImage */
  border-image: repeating-linear-gradient(to right, #999380, #999380 67px, transparent 67px, transparent 72px) 1;
  pointer-events: none;
      `}</style>
    </div>
  );
};

export default MasterHomepage;