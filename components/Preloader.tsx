import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <video
        src="/assets/0611.mp4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Preloader;