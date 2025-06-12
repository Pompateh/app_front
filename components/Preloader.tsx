import React from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  // Call onEnded after the GIF duration
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onEnded?.();
    }, 6000); // 3 seconds to match GIF duration

    return () => clearTimeout(timer);
  }, [onEnded]);

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <img
        src="/assets/preloader.gif"
        alt="Loading..."
        className="w-full h-full object-cover"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Preloader;