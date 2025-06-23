import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://app-back-gc64.onrender.com';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Helper to check if nav is disabled
  const isComingSoon = (href: string) => {
    return href === '/step';
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isComingSoon(href)) {
      e.preventDefault();
      toast.info(
        <span style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
          <span role="img" aria-label="clock" style={{ marginRight: 8 }}>⏳</span>
          <span style={{ color: '#222' }}>This feature is <b>Coming Soon</b>!</span>
        </span>,
        {
          position: 'top-center',
          autoClose: 2200,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          style: { background: '#fffbe6', border: '1.5px solid #f1c75d', boxShadow: '0 2px 12px #f1c75d22' }
        }
      );
    }
  };

  // Handler for navigating to the first project
  const goToFirstProject = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('projects')
      .select('slug')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (data && data.slug) {
      router.push(`/project/${data.slug}`);
    } else {
      toast.error('No projects found!');
    }
  };

  const goToFirstPost = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('posts')
      .select('slug')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (data && data.slug) {
      router.push(`/new/${data.slug}`);
    } else {
      toast.error('No posts found!');
    }
  };

  return (
    <header className="bg-white fixed top-0 w-full z-50 border-b-2 border-[#999380] px-4">
      <div className="absolute left-0 top-0 h-full w-2 bg-[#999380] z-40" style={{ height: '100vh' }}></div>
      
      <div className="max-w-[1500px] mx-auto relative">
        {/* Desktop Header */}
        <div className="hidden md:flex items-stretch" style={{ height: '50px' }}>
          {/* Left half - Logo/Name */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="whitespace-nowrap">
              <Image 
                src="/assets/Vector.png" 
                alt="NEWStalgia Logo" 
                width={200}
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Right half - Navigation */}
          <div className="flex-1 relative flex items-stretch justify-start">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#999380]"></div>
            <div className="flex w-full divide-x-2 divide-[#999380]">
              <div className="flex-1 flex items-center justify-center">
                <a
                  href="#"
                  onClick={goToFirstProject}
                  className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                >
                  Ấn-phẩm
                </a>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Link href="/step" onClick={e => handleNavClick(e, '/step')}
                  className="w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Quy-trình
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <a
                  href="#"
                  onClick={goToFirstPost}
                  className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                >
                  Bảng-tin
                </a>
              </div>
              <div className="flex-[2] flex items-center justify-center">
                <Link href="/shop/" className="w-full h-full flex items-center justify-center transition-all bg-yellow-400 text-gray-800 font-bold px-4 whitespace-nowrap opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', color: '#b0a99f', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Tiệm Hoài-niệm-mới ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center py-4">
          <div className="flex-shrink-0 pl-4">
            <Link href="/" className="text-3xl font-extrabold text-gray-800 whitespace-nowrap flex items-center justify-center h-full"
              style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}>
              <Image 
                src="/assets/Vector.png" 
                alt="NEWStalgia Logo" 
                width={200}
                height={40}
                style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
                priority
              />
            </Link>
          </div>
          <button
            onClick={toggleMenu}
            className="focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t-4 border-[#999380]">
            <div className="flex flex-col divide-y-2 divide-[#999380]">
              <div className="px-6 py-3">
                <a
                  href="#"
                  onClick={async (e) => { await goToFirstProject(e); setIsMenuOpen(false); }}
                  className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                >
                  Ấn-phẩm
                </a>
              </div>
              <div className="px-6 py-3">
                <Link href="/step" onClick={e => { handleNavClick(e, '/step'); setIsMenuOpen(false); }}
                  className="block w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Quy-trình
                </Link>
              </div>
              <div className="px-6 py-3">
                <a
                  href="#"
                  onClick={async (e) => { await goToFirstPost(e); setIsMenuOpen(false); }}
                  className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                >
                  Bảng-tin
                </a>
              </div>
              <div className="px-6 py-3">
                <Link href="/shop/" className="block w-full text-center bg-yellow-400 text-gray-800 font-bold py-2 px-4 transition-colors whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', color: '#b0a99f', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Tiệm Hoài-niệm-mới
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;