import React from 'react';

interface NewsSectionProps {
  imageSrc?: string;
  imagePosition?: 'left' | 'right' | 'full';
  content: string;
}

const NewsSection: React.FC<NewsSectionProps> = ({ imageSrc, imagePosition = 'left', content }) => {
  return (
    <div className={`flex ${imagePosition === 'full' ? 'flex-col' : 'flex-row'} mb-8`}>
      {imageSrc && imagePosition === 'left' && (
        <img src={imageSrc} alt="News" className="w-1/2 object-cover" />
      )}
      <div className={`flex-1 ${imagePosition === 'full' ? 'text-center' : 'px-4'}`}>
        <p>{content}</p>
      </div>
      {imageSrc && imagePosition === 'right' && (
        <img src={imageSrc} alt="News" className="w-1/2 object-cover" />
      )}
      {imageSrc && imagePosition === 'full' && (
        <img src={imageSrc} alt="News" className="w-full object-cover mt-4" />
      )}
    </div>
  );
};

export default NewsSection;