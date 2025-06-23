import React, { ReactNode } from 'react'
import Header from './Header_admin'
import Link from 'next/link'

interface LayoutProps {
  children: ReactNode
}

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/studios', label: 'Studios' },
  { href: '/admin/posts', label: 'Posts' },
]

const Layout_admin: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 shadow-sm py-8 px-4 min-h-[calc(100vh-64px)]">
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => (
              <Link key={link.href} href={link.href} legacyBehavior>
                <a className="px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 font-medium transition-colors">
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[80vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout_admin;
