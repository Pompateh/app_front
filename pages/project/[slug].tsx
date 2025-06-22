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

  const { title, blocks = [], team = [] } = project as ProjectDetail;

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
          <div key={idx} className="border-1 border-b-1 border-[#999380] md:col-span-2 overflow-hidden">
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
            <div className="p-4 prose lg:prose-lg border-2 border-[#999380]">
              <div dangerouslySetInnerHTML={{ __html: text }} />
            </div>
            {!isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
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
              <div className="border-t-2 border-l-2 border-[#999380] overflow-hidden flex">
                <img src={left.src} alt={left.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
            {right && (
              <div className="border-t-2 border-r-2 border-l-2 border-b-0 border-[#999380] overflow-hidden flex">
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
                borderClass = 'border-t-2 border-l-2 border-[#999380] overflow-hidden';
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

    return (
      <div className="mt-16 pt-8 border-t-2 border-[#999380]">
        <h2 className="text-3xl font-bold mb-8 text-center">Related Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {related.map((p) => (
            <Link key={p.id} href={`/project/${p.slug}`} className="block group">
              <div className="border-2 border-[#999380] overflow-hidden">
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-gray-600">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <VerticalLine />
      <div className="container mx-auto py-12 px-4 mt-20">
        <div className="max-w-8xl mx-auto">
          <h1 className="text-8xl md:text-5xl font-bold text-center mb-12">{title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {(blocks || []).map(renderBlock)}
          </div>
          
          {(team || []).length > 0 && renderTeam()}
          {related && related.length > 0 && renderRelatedProjects()}
        </div>
      </div>
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

    // Fetch related projects (example: from the same category)
    const { data: related, error: relatedError } = await supabase
      .from('projects')
      .select('id, title, slug, description, thumbnail')
      .eq('category', project.category)
      .neq('id', project.id)
      .limit(3);

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
