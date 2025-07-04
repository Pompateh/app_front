import type { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VerticalLine from '../../components/VerticalLine';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Block type interfaces matching Prisma schema
interface FullImageBlock {
  type: 'full_image';
  src: string;
  alt?: string;
}
interface TextBlock {
  type: 'text';
  text: string;
  layout: 'left' | 'right';
}
interface SideBySideImageBlock {
  type: 'side_by_side_image';
  data: { images: { src: string; alt?: string; layout: 'left' | 'right'; }[] };
}
interface TextAndSideImageBlock {
  type: 'text_and_side_image';
  data: {
    text: string;
    image: { src: string; alt?: string; layout: 'left' | 'right'; };
  };
}
interface ThreeGridLayoutBlock {
  type: 'three_grid_layout';
  data: {
    items: (
      | { type: 'text'; text: string; layout: 'left' | 'right'; }
      | { type: 'image'; src: string; alt?: string; layout: 'left' | 'right'; }
    )[];
  };
}

type ContentBlock = FullImageBlock | TextBlock | SideBySideImageBlock | ThreeGridLayoutBlock | TextAndSideImageBlock;

interface TeamMember {
  name: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  // Add other project fields as needed
}

interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  blocks: any[];
  team: any[];
  createdAt?: string;
  updatedAt?: string;
}

type Props = {
  project: ProjectDetail | null;
  related: ProjectDetail[];
  error?: string;
};

const ProjectPage: NextPage<Props> = ({ project, related, error: initialError }) => {
  const router = useRouter();
  const [relatedPage, setRelatedPage] = useState(0);
  const pageSize = 3;

  if (router.isFallback) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-5 mt-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (initialError || !project) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-5 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="mb-4">{initialError || "The project you're looking for doesn't exist or has been removed."}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { title, description, blocks = [], team = [] } = project as ProjectDetail;

  const renderBlock = (block: ContentBlock, idx: number) => {
    if (!block) return null;
    
    switch (block.type) {
      case 'text':
        return (
          <>
            {block.layout === 'right' && (
              <div className="border-t-2 border-l-2 border-b-2 border-[#999380] md:col-start-1 md:col-span-1"></div>
            )}
            <div
              className={`border-t-2  border-l-2 border-b-2 border-[#999380] p-4 prose lg:prose-lg ${
                block.layout === 'left' ? 'md:col-start-1 md:col-span-1' : 'md:col-start-2 md:col-span-1'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: block.text || '' }} />
            </div>
            {block.layout === 'left' && (
              <div className="border-t-2 border-b-2 border-l-2 border-r-2 border-[#999380] md:col-start-2 md:col-span-1"></div>
            )}
          </>
        );
      case 'full_image': {
        const style: React.CSSProperties = {
          width:  '100%',
          height:  'auto',
        };
        return (
          <div key={idx} className="border-b-2 border-[#999380] md:col-span-2 overflow-hidden">
            <img
              src={block.src}
              alt={block.alt || title}
              className="object-cover"
              style={style}
            />
          </div>
        );
      }
      case 'text_and_side_image': {
        const { text, image } = block.data;
        const isImageLeft = image.layout === 'left';
        return (
          <div key={idx} className="grid grid-cols-2 md:col-span-2">
            {isImageLeft && (
              <div className="border-l-2 border-b-2 border-[#999380] overflow-hidden">
                <img src={image.src} alt={image.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="p-4 prose lg:prose-lg border-l-2 border-b-2 border-[#999380]">
              <div dangerouslySetInnerHTML={{ __html: text }} />
            </div>
            {!isImageLeft && (
              <div className="border-l-2 border-b-2 border-r-2 border-[#999380] overflow-hidden">
                <img src={image.src} alt={image.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        );
      }
      case 'side_by_side_image': {
        const imgs = block.data.images;
        const left = imgs.find((i) => i.layout === 'left');
        const right = imgs.find((i) => i.layout === 'right');
        return (
          <div key={idx} className="grid grid-cols-2 gap-0 md:col-span-2">
            {left && (
              <div className=" border-l-2 border-[#999380] overflow-hidden flex">
                <img src={left.src} alt={left.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
            {right && (
              <div className=" border-r-2 border-l-2 border-b-2 border-[#999380] overflow-hidden flex">
                <img src={right.src} alt={right.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        );
      }
      case 'three_grid_layout':
        return (
          <div key={idx} className="grid grid-cols-2 grid-rows-2 gap-0 md:col-span-2">
            {block.data.items.map((item, i) => {
              let cellClass = '';
              let borderClass = 'border-2 border-[#999380] overflow-hidden';
      
              if (i === 0) {
                cellClass = 'row-start-1 col-start-1';
                borderClass = ' border-l-2 border-[#999380] overflow-hidden';
              }
              if (i === 1) {
                cellClass = 'row-start-2 col-start-1';
                borderClass = 'border-[#999380] overflow-hidden border-l-2 border-b-2';
              }
              if (i === 2) {
                cellClass = 'row-span-2 border-r-2 row-start-1 col-start-2';
              }
      
              return (
                <div key={i} className={`${cellClass} ${borderClass}`}>
                  {item.type === 'text' ? (
                    <div className="p-4 prose lg:prose-lg">
                      <div dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  ) : (
                    <img src={item.src} alt={item.alt || title} className="w-full h-full object-cover" />
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

  const renderTeam = () => {
    if (!team || team.length === 0) return null;

    return (
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-0 border-b-2 border-[#999380]">
              <div className="border-l-2 border-[#999380]"></div>
              <div className="pt-20 pr-80 pb-20 pl-8 border-r-2 border-l-2 border-[#999380]">
                {team.map((m, i) => (
                  <div key={i} className="flex justify-between border-[#999380] py-2">
                    <p className="text-sm text-gray-600">{m?.role || ''}</p>
                    <p className="font-semibold">{m?.name || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
    );
  };

  const renderRelatedProjects = () => {
    if (!related || related.length === 0) return null;

    // Pagination logic
    const totalPages = Math.ceil(related.length / pageSize);
    const startIdx = relatedPage * pageSize;
    const endIdx = startIdx + pageSize;
    const pageProjects = related.slice(startIdx, endIdx);

    return (
      <div className="w-full bg-[#f7f5ee] py-12 px-4 border-t-2 border-[#999380] relative z-20">
        <div className="max-w-[1500px] mx-auto ">
          <h2 className="text-xl font-bold mb-2 text-[#222] tracking-widest uppercase">RELATED WORKS</h2>
          <h3 className="text-3xl font-serif font-semibold mb-8">
            Xem thêm <span className="italic font-normal">Ấn-phẩm</span> khác
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageProjects.map((p) => (
              <Link key={p.id} href={`/project/${p.slug}`} className="block group">
                <div className="border-[#999380] flex flex-col items-left justify-center w-full h-auto  m-0">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="max-w-full max-h-full object-contain"
                    style={{ borderRadius: 0, background: 'none' }}
                  />
                </div>
                <div className="mt-4 text-left">
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ fontFamily: 'Gothic A1, sans-serif', letterSpacing: '0.15em' }}
                  >
                    {p.category}
                  </div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ fontFamily: 'Gothic A1, sans-serif', fontWeight: 700 }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: '#888888', fontFamily: 'Crimson Pro, serif' }}>{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => setRelatedPage((prev) => Math.max(prev - 1, 0))}
                disabled={relatedPage === 0}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                &larr;
              </button>
              <span>Page {relatedPage + 1} of {totalPages}</span>
              <button
                onClick={() => setRelatedPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={relatedPage === totalPages - 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <VerticalLine />
      <div className="container mx-auto py-12 px-4 mt-20">
        <div className="max-w-8xl mx-auto">
          <h1 className="text-8xl md:text-5xl font-bold text-center mb-6">{title}</h1>
          {description && (
            <div className="prose lg:prose-lg mx-auto mb-12 text-center" style={{ maxWidth: '800px' }}>
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {(blocks || []).map(renderBlock)}
          </div>
          
          {(team || []).length > 0 && renderTeam()}
        </div>
      </div>
      {related && related.length > 0 && renderRelatedProjects()}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;

    if (!slug) {
      return { notFound: true };
    }

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, blocks(*), team(*)')
      .eq('slug', slug)
      .single();

    if (error || !project) {
      console.error('Error fetching project from Supabase:', error);
      return { notFound: true };
    }

    // Fetch all other projects (not just same category)
    const { data: related, error: relatedError } = await supabase
      .from('projects')
      .select('id, title, slug, description, thumbnail, category')
      .neq('id', project.id);

    if (relatedError) {
      console.error('Error fetching related projects:', relatedError);
      // Non-fatal, so we can continue without related projects
    }

    return {
      props: {
        project,
        related: related || [],
      },
      };
  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return {
      props: {
        project: null,
        related: [],
        error: 'Failed to load project data.',
      },
    };
  }
};

export default ProjectPage;
