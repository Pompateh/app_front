import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header_admin: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="bg-white fixed top-0 w-full z-50 border-b shadow-sm h-16 flex items-center">
      <div className="max-w-[1500px] mx-auto w-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center h-16">
          <Link href="/" legacyBehavior>
            <a className="flex items-center gap-2">
              <img src="/assets/Vector.png" alt="NEWStalgia Logo" className="h-10 w-auto" />
              <span className="hidden md:inline text-[2rem] font-bold text-gray-800 tracking-tight">Admin Panel</span>
            </a>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center h-16">
          <Link href="/admin/projects" legacyBehavior>
            <a className="text-gray-700 hover:text-blue-700 font-medium transition-colors">Projects</a>
          </Link>
          <Link href="/admin/posts" legacyBehavior>
            <a className="text-gray-700 hover:text-blue-700 font-medium transition-colors">Posts</a>
          </Link>
          <Link href="/admin/studios" legacyBehavior>
            <a className="text-gray-700 hover:text-blue-700 font-medium transition-colors">Studios</a>
          </Link>
        </nav>
        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg animate-fadeIn">
          <div className="flex flex-col divide-y">
            <Link href="/admin/projects" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Projects</a>
            </Link>
            <Link href="/admin/posts" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Posts</a>
            </Link>
            <Link href="/admin/studios" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Studios</a>
            </Link>
            <Link href="/admin/orders" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Orders</a>
            </Link>
            <Link href="/admin/newsletter" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Newsletter</a>
            </Link>
            <Link href="/admin/shop" legacyBehavior>
              <a className="px-6 py-4 text-gray-700 hover:bg-blue-50 font-medium" onClick={() => setIsMenuOpen(false)}>Shop</a>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header_admin;