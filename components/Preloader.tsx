import React, { useRef, useEffect, useState } from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Create a new video element for preloading
    const preloadVideo = document.createElement('video');
    preloadVideo.src = '/assets/0611.mp4';
    preloadVideo.preload = 'auto';
    preloadVideo.muted = true;
    
    // Force the browser to load the video
    preloadVideo.load();

    const handleCanPlayThrough = () => {
      setIsVideoReady(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      }
    };

    preloadVideo.addEventListener('canplaythrough', handleCanPlayThrough);
    
    return () => {
      preloadVideo.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  if (!isVideoReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

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