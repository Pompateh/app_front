import React, { ReactNode } from 'react'
import Header from './Header_admin'

interface LayoutProps {
  children: ReactNode
}

const Layout_admin: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout_admin;
