import React, { useRef, useEffect } from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Ensure video starts playing immediately
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
        });
      }
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src="/assets/0611.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ display: 'block' }}
        onEnded={onEnded}
        onError={(e) => console.error('Video error:', e)}
      />
    </div>
  );
};

export default Preloader;