import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
    </div>
  );
};

export default Preloader;