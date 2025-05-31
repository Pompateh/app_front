import { useEffect, useState } from 'react';
import { API } from '../../utils/api';
import Layout from '../../components/Layout';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail: string;
  category: string;
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API}/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.slug}`}
              className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${project.thumbnail || '/path/to/default-thumbnail.jpg'}`}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-500">{project.category}</p>
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}