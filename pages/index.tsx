import type { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { NavigationProvider } from '../components/NavigationContext';
import StudioNavigation from '../components/StudioNavigation';
import VerticalLineBlack from '../components/VerticalLine_black';
import Preloader from '../components/Preloader';
import { supabase } from '../lib/supabaseClient';
import React, { useState, useEffect } from 'react';

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

interface MasterHomepageProps {
  studios: Studio[];
  error?: string;
}

const MasterHomepage: NextPage<MasterHomepageProps> = ({ studios, error }) => {
  const [showPreloader, setShowPreloader] = useState(false);
  const [isNightTime, setIsNightTime] = useState(false);

  useEffect(() => {
    // Check if it's night time (after 9 PM)
    const checkTime = () => {
      const currentHour = new Date().getHours();
      setIsNightTime(currentHour >= 19 || currentHour < 6);
    };

    // Check immediately
    checkTime();

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenPreloader');
      if (!seen) {
        setShowPreloader(true);
      }
    }
  }, []);

  const handlePreloaderEnd = () => {
    localStorage.setItem('hasSeenPreloader', 'true');
    setShowPreloader(false);
  };

  if (showPreloader) {
    return <Preloader onEnded={handlePreloaderEnd} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!studios || studios.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No studios found.</p>
      </div>
    );
  }

  return (
    <div className="homepage-fade-in">
      <div className="flex-1 h-screen snap-y snap-mandatory overflow-y-auto">
        <VerticalLineBlack />
        {studios.map((studio) => (
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
                  <div className="absolute inset-0 opacity-20" style={{ transform: 'translateY(0px)' }} />
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
                        <div className="text-black" style={{ fontSize: '0.75rem', fontFamily: 'Gothic A1, sans-serif', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.1, position: 'absolute', right: 12, bottom: 10, padding: '0 8px 5px 8px', background: 'rgba(255,255,255,0.85)', borderRadius: '4px' }}>
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
className="relative border border-[#999380] bg-black text-white"
style={{ width: '350px', minHeight: '400px', height: 'auto', paddingBottom: '3.5rem' }}
>
                  {/* Doodle Stickers Around the Studio Box */}
                  <img 
                    src={isNightTime ? "/assets/sleepy.png" : "/assets/Layer_12.png"} 
                    alt={isNightTime ? "Sleepy Doodle" : "Doodle Far Bottom Left"} 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-40px', 
                      right: '-90px', 
                      width: '100px', 
                      height: '100px', 
                      zIndex: 10,
                      transition: 'opacity 0.3s ease-in-out'
                    }} 
                  />
                  <div className="p-4">
                    <div className="w-full">
                      {studio.logo ? (
                        <div className="flex items-center w-full" style={{ height: '2.5rem', marginBottom: '0.75rem' }}>
                          <img
                            src="/assets/Vector-w.png"
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
                      <hr className="border-t border-[#999380] mt-2 w-full" />
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
                      <hr className="border-t border-[#999380] mt-2 w-full" />
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
              <div className="w-full border-[#999380]">
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
        ))}
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data, error } = await supabase.from('studios').select('*');

    if (error) {
      throw new Error(error.message);
    }

    return {
      props: {
        studios: data,
      },
    };
  } catch (error: any) {
    return {
      props: {
        studios: [],
        error: error.message,
      },
    };
  }
};

export default MasterHomepage;