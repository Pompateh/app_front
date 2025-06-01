import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VerticalLine from '../../components/VerticalLine';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  category: string;
  blocks: ContentBlock[];
  team: TeamMember[];
  thumbnail: string;
}

const API_BASE = 'https://app-back-gc64.onrender.com/api';

const blockVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      type: 'spring',
      stiffness: 80,
    },
  }),
};

const teamVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      type: 'spring',
      stiffness: 100,
    },
  }),
};

interface Props {
  project: ProjectDetail;
  related: ProjectDetail[];
}

const ProjectPage: NextPage<Props> = ({ project, related }) => {
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

  if (!project) {
    return <div>Error: Project data not found.</div>;
  }

  const { title, blocks, team } = project;

  const renderBlock = (block: ContentBlock, idx: number) => {
    if (!block || !block.type) return null;

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
          width: '100%',
          height: 'auto',
        };
        if (!block.src) return null;
        return (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockVariants}
            className="border-1 border-b-1 border-[#999380] md:col-span-2 overflow-hidden"
          >
            <img
              src={block.src?.startsWith('http') ? block.src : `${API_BASE}/uploads/${block.src}`}
              alt={block.alt || title}
              className="object-cover"
              style={style}
            />
          </motion.div>
        );
      }
      case 'text_and_side_image': {
        if (!block.data) return null;

        const { text, image } = block.data;
        const isImageLeft = image?.layout === 'left';
        if (!image?.src) return null;

        return (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockVariants}
            className="grid grid-cols-2 gap-4 md:col-span-2"
          >
            {isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
                <img 
                  src={image.src?.startsWith('http') ? image.src : `${API_BASE}/uploads/${image.src}`} 
                  alt={image.alt || title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
            <div className="p-4 prose lg:prose-lg border-2 border-[#999380]">
              <div dangerouslySetInnerHTML={{ __html: text || '' }} />
            </div>
            {!isImageLeft && (
              <div className="border-2 border-[#999380] overflow-hidden">
                <img 
                  src={image.src?.startsWith('http') ? image.src : `${API_BASE}/uploads/${image.src}`} 
                  alt={image.alt || title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
          </motion.div>
        );
      }
      case 'side_by_side_image': {
        if (!block.data || !Array.isArray(block.data.images)) return null;

        const imgs = block.data.images;
        const left = imgs.find((i) => i.layout === 'left');
        const right = imgs.find((i) => i.layout === 'right');
        
        if (!left?.src && !right?.src) return null;

        return (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockVariants}
            className="grid grid-cols-2 gap-0 md:col-span-2"
          >
            {left && left.src && (
              <div className="border-t-2 border-[#999380] overflow-hidden flex">
                <img 
                  src={left.src?.startsWith('http') ? left.src : `${API_BASE}/uploads/${left.src}`} 
                  alt={left.alt || title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
            {right && right.src && (
              <div className="border-t-2 border-l-2 border-b-0 border-[#999380] overflow-hidden flex">
                <img 
                  src={right.src?.startsWith('http') ? right.src : `${API_BASE}/uploads/${right.src}`} 
                  alt={right.alt || title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
          </motion.div>
        );
      }
      case 'three_grid_layout':
        if (!block.data || !Array.isArray(block.data.items)) return null;

        return (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockVariants}
            className="grid grid-cols-2 grid-rows-2 gap-0 md:col-span-2"
          >
            {block.data.items.map((item, i) => {
              if (!item || !item.type) return null;

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
                      <div dangerouslySetInnerHTML={{ __html: item.text || '' }} />
                    </div>
                  ) : item.type === 'image' && item.src ? (
                    <img 
                      src={item.src?.startsWith('http') ? item.src : `${API_BASE}/uploads/${item.src}`} 
                      alt={item.alt || title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : null}
                </div>
              );
            })}
          </motion.div>
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
          {Array.isArray(blocks) && blocks.map(renderBlock)}
        </div>
        {Array.isArray(team) && team.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              className="grid grid-cols-2 gap-0 border-b-2 border-[#999380]"
              initial="hidden"
              animate="visible"
              variants={{}}
            >
              <div className="border-l-2 border-t-2 border-[#999380]"></div>
              <div className="pt-20 pr-80 pb-20 pl-8 border-r-2 border-l-2 border-t-2 border-[#999380]">
                {Array.isArray(team) && team.map((m, i) => (
                  m && m.name && m.role ? (
                    <motion.div
                      key={i}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      variants={teamVariants}
                      className="flex justify-between border-[#999380] py-2"
                    >
                      <p className="text-sm text-gray-600">{m.role}</p>
                      <p className="font-semibold">{m.name}</p>
                    </motion.div>
                  ) : null
                ))}
              </div>
            </motion.div>
          </motion.section>
        )}
      </div>
      {Array.isArray(related) && related.length > 0 && (
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
              {Array.isArray(related) && related.map((r) => (
                r && r.id && r.slug && r.title ? (
                  <Link
                    key={r.id}
                    href={`/project/${r.slug}`}
                    className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <img
                      src={r.thumbnail?.startsWith('http') ? r.thumbnail : `${API_BASE}/uploads/${r.thumbnail}`}
                      alt={r.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-500">{r.category || ''}</p>
                      <h3 className="text-xl font-semibold">{r.title}</h3>
                      <p className="text-sm text-gray-500 mt-2">{r.description || ''}</p>
                    </div>
                  </Link>
                ) : null
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) {
      return { paths: [], fallback: true };
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      return { paths: [], fallback: true };
    }

    const paths = projects.map((project) => ({
      params: { slug: project.slug },
    }));

    return { paths, fallback: true };
  } catch (error) {
    console.error('Error fetching project paths:', error);
    return { paths: [], fallback: true };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  try {
    const slug = params?.slug;
    if (!slug) {
      return { notFound: true };
    }

    // Fetch the specific project by slug
    const projectResponse = await fetch(`${API_BASE}/projects/slug/${slug}`);
    if (!projectResponse.ok) {
      console.error(`Failed to fetch project with slug ${slug}:`, projectResponse.status);
      return { notFound: true };
    }
    const project = await projectResponse.json();

    if (!project) {
       console.error(`Project with slug ${slug} not found`);
      return { notFound: true };
    }

    // Get all projects to find related ones (excluding the current)
    const allResponse = await fetch(`${API_BASE}/projects`);
     if (!allResponse.ok) {
       console.error('Failed to fetch all projects for related list:', allResponse.status);
       // Still return the project even if related fetch fails
        const processedProject = {
           ...project,
           thumbnail: project.thumbnail?.startsWith('http') ? project.thumbnail : `${API_BASE}/uploads/${project.thumbnail}`,
            blocks: project.blocks?.map((block: ContentBlock) => {
             if (block.type === 'full_image') {
               return {
                 ...block,
                 src: block.src?.startsWith('http') ? block.src : `${API_BASE}/uploads/${block.src}`
               };
             }
             if (block.type === 'text_and_side_image') {
               return {
                 ...block,
                 data: {
                   ...block.data,
                   image: {
                     ...block.data.image,
                     src: block.data.image.src?.startsWith('http') ? block.data.image.src : `${API_BASE}/uploads/${block.data.image.src}`
                   }
                 }
               };
             }
              if (block.type === 'side_by_side_image') {
               return {
                 ...block,
                 data: {
                   ...block.data,
                   images: block.data.images.map((img: { src: string; alt?: string; layout: 'left' | 'right' }) => ({
                     ...img,
                      src: img.src?.startsWith('http') ? img.src : `${API_BASE}/uploads/${img.src}`
                    }))
                  }
                };
              }
              if (block.type === 'three_grid_layout') {
                return {
                  ...block,
                  data: {
                    ...block.data,
                    items: block.data.items.map((item: { type: 'text' | 'image'; text?: string; src?: string; alt?: string; layout: 'left' | 'right' }) => {
                      if (item.type === 'image') {
                        return {
                          ...item,
                         src: item.src?.startsWith('http') ? item.src : `${API_BASE}/uploads/${item.src}`
                        };
                      }
                      return item;
                    })
                  }
                };
              }
              return block;
            })
          };

       return {
         props: {
           project: processedProject,
           related: [] // Return empty related list if fetch fails
         },
         revalidate: 60,
       };
     }

    const all = await allResponse.json();
    const related = Array.isArray(all) ? all.filter(p => p.slug !== slug) : [];

    // Process image URLs for the project and related projects
    const processedProject = {
      ...project,
      thumbnail: project.thumbnail?.startsWith('http') ? project.thumbnail : `${API_BASE}/uploads/${project.thumbnail}`,
      blocks: project.blocks?.map((block: ContentBlock) => {
        if (block.type === 'full_image') {
          return {
            ...block,
            src: block.src?.startsWith('http') ? block.src : `${API_BASE}/uploads/${block.src}`
          };
        }
        if (block.type === 'text_and_side_image') {
          return {
            ...block,
            data: {
              ...block.data,
              image: {
                ...block.data.image,
                src: block.data.image.src?.startsWith('http') ? block.data.image.src : `${API_BASE}/uploads/${block.data.image.src}`
              }
            }
          };
        }
        if (block.type === 'side_by_side_image') {
          return {
            ...block,
            data: {
              ...block.data,
              images: block.data.images.map((img: { src: string; alt?: string; layout: 'left' | 'right' }) => ({
                ...img,
                src: img.src?.startsWith('http') ? img.src : `${API_BASE}/uploads/${img.src}`
              }))
            }
          };
        }
        if (block.type === 'three_grid_layout') {
          return {
            ...block,
            data: {
              ...block.data,
              items: block.data.items.map((item: { type: 'text' | 'image'; text?: string; src?: string; alt?: string; layout: 'left' | 'right' }) => {
                if (item.type === 'image') {
                  return {
                    ...item,
                    src: item.src?.startsWith('http') ? item.src : `${API_BASE}/uploads/${item.src}`
                  };
                }
                return item;
              })
            }
          };
        }
        return block;
      })
    };

    const processedRelated = related.map(project => ({
      ...project,
      thumbnail: project.thumbnail?.startsWith('http') ? project.thumbnail : `${API_BASE}/uploads/${project.thumbnail}`
    }));

    return {
      props: {
        project: processedProject,
        related: processedRelated
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching project or related projects:', error);
    return { notFound: true };
  }
};

export default ProjectPage;
