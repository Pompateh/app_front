import React, { useState } from 'react';

interface PreloaderProps {
  onEnded?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onEnded }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Call onEnded after a fixed duration that matches your GIF length
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onEnded?.();
    }, 2000); // Adjust this time to match your GIF duration

    return () => clearTimeout(timer);
  }, [onEnded]);

  const handleLoad = (): void => {
    setIsLoading(false);
  };

  const handleError = (): void => {
    setHasError(true);
    setIsLoading(false);
    // If the GIF fails to load, we should still trigger onEnded after a delay
    setTimeout(() => {
      onEnded?.();
    }, 2000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      )}
      {hasError ? (
        <div className="text-white text-center">
          <p>Failed to load preloader</p>
          <p className="text-sm mt-2">Please refresh the page</p>
        </div>
      ) : (
        <img
          src="/assets/preloader.gif"
          alt="Loading..."
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default Preloader;