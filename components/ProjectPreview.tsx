// components/ProjectPreview.tsx
import React from 'react';

interface ContentBlockForm {
  type: string;
  layout?: 'left' | 'right';
  src?: string;
  text?: string;
  data?: any;
  alt?: string;
}
interface ProjectForm {
  title: string;
  description: string;
  category: string;
  blocks: ContentBlockForm[];
  team: { name: string; role: string }[];
}

interface PreviewProps {
  data: ProjectForm;
}

const ProjectPreview: React.FC<PreviewProps> = ({ data }) => {
  const renderBlock = (block: ContentBlockForm, i: number) => {
    switch (block.type) {
      case 'text':
        return (
          <>
            {block.layout === 'right' && (
              <div className="border-t-2 border-l-2 border-b-2 border-[#999380] md:col-start-1 md:col-span-1"></div>
            )}
            <div
              key={i}
              className={`border-t-2 border-r-2 border-l-2 border-b-2 border-[#999380] p-4 prose lg:prose-lg ${
                block.layout === 'left' ? 'md:col-start-1 md:col-span-1' : 'md:col-start-2 md:col-span-1'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: block.text || '' }} />
            </div>
            {block.layout === 'left' && (
              <div className="border-2 border-[#999380] md:col-start-2 md:col-span-1"></div>
            )}
          </>
        );
      case 'full_image':
        return (
          <div key={i} className="border-1 border-b-1 border-[#999380] md:col-span-2 overflow-hidden">
            <img src={block.src} alt={block.alt || ''} className="object-cover w-full h-auto" />
          </div>
        );
      case 'text_and_side_image': {
        const isImageLeft = block.data?.image?.layout === 'left';
        return (
          <div key={i} className="grid grid-cols-2 gap-0 md:col-span-2">
            {isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
                <img src={block.data.image.src} alt={block.data.image.alt || ''} className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="prose lg:prose-lg border-2 border-[#999380] p-4">
              <div dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
            </div>
            {!isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
                <img src={block.data.image.src} alt={block.data.image.alt || ''} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        );
      }
      case 'side_by_side_image': {
        const imgs = block.data.images;
        const left = imgs.find((i: any) => i.layout === 'left');
        const right = imgs.find((i: any) => i.layout === 'right');
        return (
          <div key={i} className="grid grid-cols-2 gap-0 md:col-span-2">
            {left && (
              <div className="border-t-2 border-[#999380] overflow-hidden">
                <img src={left.src} alt={left.alt || ''} className="w-full h-auto object-cover" />
              </div>
            )}
            {right && (
              <div className="border-t-2 border-l-2 border-[#999380] overflow-hidden">
                <img src={right.src} alt={right.alt || ''} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        );
      }
      case 'three_grid_layout':
        return (
          <div key={i} className="grid grid-cols-2 grid-rows-2 gap-0 md:col-span-2">
            {block.data.items.map((item: any, idx: number) => {
              let cellClass = '';
              let borderClass = 'border-2 border-[#999380] overflow-hidden';

              if (idx === 0) {
                cellClass = 'row-start-1 col-start-1';
                borderClass = 'border-t-2 border-l-2 border-b-2 border-[#999380] overflow-hidden';
              }
              if (idx === 1) {
                cellClass = 'row-start-2 col-start-1';
                borderClass = 'border-b-2 border-[#999380] overflow-hidden border-l-2';
              }
              if (idx === 2) {
                cellClass = 'row-start-1 row-span-2 col-start-2';
                borderClass = 'border-t-2 border-r-2 border-l-2 border-[#999380] overflow-hidden';
              }

              return (
                <div key={idx} className={`${cellClass} ${borderClass}`}>
                  {item.type === 'text' ? (
                    <div className="p-4 prose lg:prose-lg">
                      <div dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  ) : (
                    <img src={item.src} alt={item.alt || ''} className="w-full h-full object-cover" />
                  )}
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative max-h-[80vh] overflow-y-auto p-6 bg-white rounded shadow-lg">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{data.title}</h1>
        <p className="text-lg text-gray-600 mt-2">{data.description}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {data.blocks.map((block, i) => renderBlock(block, i))}
      </div>

      {data.team.length > 0 && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-0 border-b-2 border-[#999380]">
            <div className="border-l-2 border-[#999380]" />
            <div className="pt-20 pr-10 pb-20 pl-8 border-r-2 border-l-2 border-[#999380]">
              {data.team.map((m, i) => (
                <div key={i} className="flex justify-between border-[#999380] py-2">
                  <p className="text-sm text-gray-600">{m.role}</p>
                  <p className="font-semibold">{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectPreview;
