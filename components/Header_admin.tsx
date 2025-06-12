import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header_admin: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
<header className="bg-white fixed top-0 w-full z-50 border-b-2 border-[#999380]"> {/* Increased border thickness */}
  {/* Vertical Divider */}
  <div className="absolute left-0 top-0 h-full w-2 bg-[#999380] z-40" style={{ height: '100vh' }}></div> {/* Increased width */}
  
  {/* Added px-6 for consistent horizontal padding */}
  <div className="max-w-[1500px] mx-auto relative">
    {/* Desktop Header */}
    <div className="hidden md:flex items-stretch" style={{ height: '50px' }}>
      {/* Left half - Logo/Name */}
      <div className="flex-1 flex items-center justify-start">
        <Link href="/" legacyBehavior>
          <a className="whitespace-nowrap">
            <img src="/assets/logo-01.png" alt="NEWStalgia Logo" className="h-10" />
          </a>
        </Link>
      </div>

      {/* Right half - Navigation with a vertical divider */}
      <div className="flex-1 relative flex items-stretch justify-start ">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#999380]"></div> {/* Increased width */}
        <div className="flex w-full divide-x-2 divide-[#999380]"> {/* Increased divide thickness */}
          <div className="flex-1 flex items-center justify-center">
            <Link href="/admin/projects" legacyBehavior>
              <a className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap">
                Project
              </a>
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Link href="/admin/posts" legacyBehavior>
              <a className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap">
                Post
              </a>
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Link href="/admin/studios" legacyBehavior>
              <a className="w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap">
                Studios
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
    {/* Mobile Header */}
    <div className="md:hidden flex justify-between items-center py-4">
      <div className="flex-shrink-0">
        <Link href="/" legacyBehavior>
          <a className="text-3xl font-extrabold text-gray-800 whitespace-nowrap">
            NEWStalgia
          </a>
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
      <nav className="md:hidden bg-white border-t-4 border-[#999380]"> {/* Increased border thickness */}
        <div className="flex flex-col divide-y-2 divide-[#999380]"> {/* Increased divide thickness */}
          <div className="px-6 py-3">
            <Link href="/product" legacyBehavior>
              <a
                className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap"
                onClick={() => setIsMenuOpen(false)}
              >
                Ấn-phẩm
              </a>
            </Link>
          </div>
          <div className="px-6 py-3">
            <Link href="/step" legacyBehavior>
              <a
                className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap"
                onClick={() => setIsMenuOpen(false)}
              >
                Quy-trình
              </a>
            </Link>
          </div>
          <div className="px-6 py-3">
            <Link href="/new" legacyBehavior>
              <a
                className="block w-full text-center text-gray-800 hover:underline transition-all whitespace-nowrap"
                onClick={() => setIsMenuOpen(false)}
              >
                Bảng-tin
              </a>
            </Link>
          </div>
          <div className="px-6 py-3">
            <Link href="/shop" legacyBehavior>
              <a
                className="block w-full text-center bg-yellow-400 text-gray-800 font-bold py-2 px-4 hover:bg-yellow-500 transition-colors whitespace-nowrap"
                onClick={() => setIsMenuOpen(false)}
              >
                Tiệm Hoài-niệm-mới
              </a>
            </Link>
          </div>
        </div>
      </nav>
    )}
  </div>
</header>
  );
};

export default Header_admin;