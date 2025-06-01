import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VerticalLine from '../../components/VerticalLine';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API } from '../../utils/api';

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
  blocks: ContentBlock[];
  team: TeamMember[];
  category: string;
  description: string;
  thumbnail : string;
}

type Props = {
  project: ProjectDetail;
  related: ProjectDetail[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

const ProjectPage: NextPage<Props> = ({ project, related }) => {
  const router = useRouter();
  const { slug } = router.query;
  const [projectState, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      try {
        // First try to get from static props
        if (project) {
          setProject(project);
          setLoading(false);
          return;
        }

        // If not available from static props, fetch from API
        const response = await fetch(`https://app-back-gc64.onrender.com/api/projects/${slug}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug, project]);

  if (loading) {
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

  if (!projectState) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-5 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="mb-4">The project you're looking for doesn't exist or has been removed.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { title, blocks, team } = projectState as ProjectDetail;

  const renderBlock = (block: ContentBlock, idx: number) => {
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
          <div key={idx} className="grid grid-cols-2 gap-4 md:col-span-2">
            {isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
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
              <div className="border-t-2 border-[#999380] overflow-hidden flex">
                <img src={left.src} alt={left.alt || title} className="w-full h-auto object-cover" />
              </div>
            )}
            {right && (
              <div className="border-t-2 border-l-2 border-b-0 border-[#999380] overflow-hidden flex">
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
                borderClass = 'border-[#999380] overflow-hidden border-l-2';
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

  return (
    <Layout>
      <VerticalLine />
      <div className="container mx-auto py-12 px-5 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {blocks.map(renderBlock)}
        </div>
        {team.length > 0 && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-0 border-b-2 border-[#999380]">
              <div className="border-l-2 border-[#999380]"></div>
              <div className="pt-20 pr-80 pb-20 pl-8 border-r-2 border-l-2 border-[#999380]">
                {team.map((m, i) => (
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
      {related.length > 0 && (
        <section className="w-full bg-[#eeebdd] py-12">
          <div className="container mx-auto space-y-6 px-5">
          <h1 className="text-2xl font-semibold">Related Projects</h1>
<div className="flex items-center justify-between ">
  <button className="text-3xl font-bold text-gray-800 hover:underline mb-16">
    Xem thêm Ấn-phẩm khác
  </button>
  <img src="/assets/newstalgia-doodle.svg" alt="Newstalgia Doodle" className="w-16 h-16" />
</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((r) => (
  <Link
    key={r.id}
    href={`/project/${r.slug}`}
    className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
  >
   <img
src={r.thumbnail || '/path/to/default-thumbnail.jpg'} // Use thumbnail or a default image
alt={r.title}
className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <p className="text-sm text-gray-500">{r.category}</p> {/* Display project type */}
      <h3 className="text-xl font-semibold">{r.title}</h3>
      <p className="text-sm text-gray-500 mt-2">{r.description}</p>
    </div>
  </Link>
))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    if (!slug) {
      return { notFound: true };
    }

    const response = await fetch(`https://app-back-gc64.onrender.com/api/projects/${slug}`);
    if (!response.ok) {
      console.error(`API responded with status: ${response.status} for slug: ${slug}`);
      return { notFound: true };
    }

    const project = await response.json();
    
    // Fetch related projects
    const allProjectsResponse = await fetch(`https://app-back-gc64.onrender.com/api/projects`);
    if (!allProjectsResponse.ok) {
      console.error('Failed to fetch related projects');
      return { 
        props: { 
          project,
          related: []
        },
        revalidate: 60,
      };
    }
    
    const allProjects = await allProjectsResponse.json();
    const related = Array.isArray(allProjects) 
      ? allProjects.filter(p => p.id !== project.id).slice(0, 3)
      : [];

    return {
      props: { 
        project,
        related
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetch(`https://app-back-gc64.onrender.com/api/projects`);
    if (!response.ok) {
      console.error('Failed to fetch projects for static paths');
      return { paths: [], fallback: true };
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      console.error('Invalid projects data format');
      return { paths: [], fallback: true };
    }

    const paths = projects.map((project) => ({
      params: { slug: project.slug },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return { paths: [], fallback: true };
  }
};

export default ProjectPage;
