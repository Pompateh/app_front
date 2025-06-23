import React, { useRef } from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    if (onEnded) onEnded();
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black fixed top-0 left-0 z-50">
      <video
        ref={videoRef}
        src="/assets/0611.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        controls={false}
        onEnded={handleEnded}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Preloader;