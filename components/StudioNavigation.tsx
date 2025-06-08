import React from 'react';
import { useNavigation } from './NavigationContext';

interface NavItem {
  label: string;
  href: string;
}

interface StudioNavigationProps {
  navItems: NavItem[];
}

const StudioNavigation: React.FC<StudioNavigationProps> = ({ navItems }) => {
  const { activeLink, setActiveLink } = useNavigation();

  return (
    <nav className="bg-[#1A1916]">
      <ul className="flex m-0 p-0 list-none">
        {navItems.map((item) => (
          <li key={item.href} className="flex-1 text-center">
            <a
              href={item.href}
              onClick={() => setActiveLink(item.href)}
              className={`block no-underline py-3 px-4 border border-[#999380]  
                ${activeLink === item.href ? 'text-[#EEE]' : 'text-[#CCC]'}`}
              style={{
                fontFamily: '"Gothic A1", sans-serif',
                fontWeight: 800
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default StudioNavigation;