import Link from 'next/link'
import { FC } from 'react'

export interface NavItem {
  label: string
  href: string
  icon?: string  // Could be a URL or a component name
}

interface NavigationProps {
  items: NavItem[]
  className?: string
}

const Navigation: FC<NavigationProps> = ({ items, className = '' }) => {
  return (
    <nav className={`fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 flex space-x-4 ${className}`}>
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <a className="flex flex-col items-center text-white hover:text-gray-400">
            {item.icon && (
              // If using an icon image
              <img src={item.icon} alt={`${item.label} icon`} className="w-6 h-6 mb-1" />
            )}
            <span className="text-sm">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  )
}

export default Navigation
