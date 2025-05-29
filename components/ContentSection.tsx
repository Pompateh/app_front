import React from 'react';

type ContentSectionProps = {
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  fullWidthImage?: boolean;
  children: React.ReactNode;
};

export function ContentSection({
  imageSrc,
  imageAlt = '',
  imagePosition = 'left',
  fullWidthImage = false,
  children,
}: ContentSectionProps) {
  // Determine layout: vertical if fullWidth or top/bottom
  const isVertical = fullWidthImage || imagePosition === 'top' || imagePosition === 'bottom';
  const containerClass = isVertical ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-6 items-center';

  // Determine order for swap
  const imgOrder = imagePosition === 'right' || imagePosition === 'bottom' ? 'order-2' : 'order-1';
  const txtOrder = imagePosition === 'right' || imagePosition === 'bottom' ? 'order-1' : 'order-2';

  return (
    <section className={`${containerClass} mb-12`}>
      {imageSrc && (
        <div className={`${isVertical ? 'w-full' : ''} ${imgOrder}`}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className={`w-full object-cover ${fullWidthImage ? 'h-96' : 'rounded-lg'}`}
          />
        </div>
      )}
      <div className={`prose ${txtOrder}`}>{children}</div>
    </section>
  );
}