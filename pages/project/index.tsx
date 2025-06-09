import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://app-back-gc64.onrender.com';

const ProjectIndex = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchFirstProject = async () => {
      try {
        const response = await fetch(`${API_BASE}/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        if (Array.isArray(projects) && projects.length > 0) {
          router.replace(`/project/${projects[0].slug}`);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchFirstProject();
  }, [router]);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-5 mt-20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectIndex; 