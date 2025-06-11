import React from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <video
        src="/assets/0611.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ display: 'block' }}
        onEnded={onEnded}
      />
    </div>
  );
};

export default Preloader;