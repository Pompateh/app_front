import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/dashboard') ? 'bg-gray-700' : ''
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/studios" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/studios') ? 'bg-gray-700' : ''
                }`}
              >
                Studios
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/projects" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/projects') ? 'bg-gray-700' : ''
                }`}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/posts" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/posts') ? 'bg-gray-700' : ''
                }`}
              >
                Posts
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/shop" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/shop') ? 'bg-gray-700' : ''
                }`}
              >
                Shop
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/orders" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/orders') ? 'bg-gray-700' : ''
                }`}
              >
                Orders
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/newsletter" 
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  isActive('/admin/newsletter') ? 'bg-gray-700' : ''
                }`}
              >
                Newsletter
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;