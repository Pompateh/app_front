import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://app-back-gc64.onrender.com';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [firstProjectSlug, setFirstProjectSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchFirstProject = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch projects:', response.statusText);
          return;
        }
        const projects = await response.json();
        console.log('Fetched projects:', projects);
        if (Array.isArray(projects) && projects.length > 0 && projects[0].slug) {
          setFirstProjectSlug(projects[0].slug);
        } else {
          console.error('No valid project found in response');
        }
      } catch (error) {
        console.error('Error fetching first project:', error);
      }
    };

    fetchFirstProject();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Helper to check if nav is disabled
  const isComingSoon = (href: string) => {
    return href === '/step' || href === '/new';
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

  return (
    <header className="bg-white fixed top-0 w-full z-50 border-b-2 border-[#999380]">
      <div className="absolute left-0 top-0 h-full w-2 bg-[#999380] z-40" style={{ height: '100vh' }}></div>
      
      <div className="w-full relative">
        {/* Desktop Header */}
        <div className="hidden md:flex items-stretch" style={{ height: '50px' }}>
          {/* Left half - Logo/Name */}
          <div className="w-1/2 flex items-center justify-start">
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
          <div className="w-1/2 relative flex items-stretch justify-start">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#999380]"></div>
            <div className="flex w-full divide-x-2 divide-[#999380]">
              <div className="flex-1 flex items-center justify-center">
                <Link 
                  href={firstProjectSlug ? `/project/${firstProjectSlug}` : '/project'} 
                  className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                  onClick={(e) => {
                    if (!firstProjectSlug) {
                      e.preventDefault();
                      toast.error('No projects available');
                    }
                  }}>
                  Ấn-phẩm
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Link href="/step" onClick={e => handleNavClick(e, '/step')}
                  className="w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c25d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Quy-trình
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Link href="/new/" className="w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Bảng-tin
                </Link>
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
                <Link 
                  href={firstProjectSlug ? `/project/${firstProjectSlug}` : '/project'} 
                  className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap flex items-center justify-center h-full"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800 }}
                  onClick={(e) => {
                    if (!firstProjectSlug) {
                      e.preventDefault();
                      toast.error('No projects available');
                    }
                    setIsMenuOpen(false);
                  }}>
                  Ấn-phẩm
                </Link>
              </div>
              <div className="px-6 py-3">
                <Link href="/step" onClick={e => { handleNavClick(e, '/step'); setIsMenuOpen(false); }}
                  className="block w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c25d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Quy-trình
                </Link>
              </div>
              <div className="px-6 py-3">
                <Link href="/new/" className="block w-full text-center transition-all whitespace-nowrap flex items-center justify-center h-full opacity-60 cursor-not-allowed pointer-events-auto"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 800, color: '#b0a99f', background: 'linear-gradient(90deg, #fffbe6 0%, #f1c75d22 100%)', borderColor: '#f1c75d' }}
                  aria-disabled="true"
                  tabIndex={-1}>
                  Bảng-tin
                </Link>
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