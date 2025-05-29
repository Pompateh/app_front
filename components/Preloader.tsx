import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <img
        src="/assets/logo-02.png"
        alt="Newstalgia Logo"
        className="preloader-logo"
        style={{ maxWidth: '300px', maxHeight: '300px' }}
      />
      <style jsx>{`
        .preloader-logo {
          opacity: 0;
          transform: scale(0.8);
          animation: logoFadeInScale 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes logoFadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          60% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Preloader;