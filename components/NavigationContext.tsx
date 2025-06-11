import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeLink: string;
  setActiveLink: (link: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({
  children,
  initialActiveLink = '',
}: {
  children: ReactNode;
  initialActiveLink?: string;
}) => {
  const [activeLink, setActiveLink] = useState(initialActiveLink);
  return (
    <NavigationContext.Provider value={{ activeLink, setActiveLink }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};