import Link from 'next/link'
import React, { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
              <Link href="/admin/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/studios" className="hover:text-gray-300">
                Manage Studios
              </Link>
            </li>
            <li>
              <Link href="/admin/projects" className="hover:text-gray-300">
                Manage Projects
              </Link>
            </li>
            <li>
              <Link href="/admin/shop" className="hover:text-gray-300">
                Manage Shop
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="hover:text-gray-300">
                Manage Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/newsletter" className="hover:text-gray-300">
                Manage Newsletter
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="hover:text-gray-300">
                Manage Users
              </Link>
            </li>
            <li>
              <Link href="/admin/posts" className="hover:text-gray-300">
                Manage Posts
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout;