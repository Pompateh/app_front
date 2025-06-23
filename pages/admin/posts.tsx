import { useState, useEffect } from 'react';
import AdminLayout from '@/components/Layout_admin'
import { withAuth } from '../../components/withAuth';
import { toast, ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../lib/supabaseClient';
import { GetServerSideProps } from 'next';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

function sanitizePostPayload(data: Partial<Post>) {
  return {
    title: data.title || '',
    slug: data.slug || '',
    summary: data.summary || '',
    featured_image: data.featured_image || '',
    published: data.published ?? false,
    published_at: data.published ? new Date().toISOString() : null,
    content: data.content || '',
    reference_pic_url: data.reference_pic_url || '',
    reference_pic_name: data.reference_pic_name || '',
    author_name: data.author_name || '',
    author_job_title: data.author_job_title || '',
    post_date: data.post_date ? new Date(data.post_date).toISOString() : null,
    reading_time: data.reading_time || '',
    content_sources: Array.isArray(data.content_sources)
      ? data.content_sources
      : [],
    additional_content: JSON.stringify(data.additional_content ?? []), // Serialize to JSON string
    quote: data.quote || '',
    quote_author: data.quote_author || '',
    type: data.type || '',
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  published: boolean;
  published_at: string;
  type: string;
  author_name: string;
  author_job_title: string;
  post_date: string;
  reading_time: string;
  content: string;
  content_sources: string[];
  reference_pic_url: string;
  reference_pic_name: string;
  additional_content: { title: string; paragraph: string }[];
  quote: string;
  quote_author: string;
  created_at: string;
}

interface AdminPostsProps {
  initialPosts: Post[];
  error?: string;
}

const defaultFormData: Post = {
  id: '',
  title: '',
  slug: '',
  summary: '',
  featured_image: '',
  published: false,
  published_at: '',
  type: '',
  author_name: '',
  author_job_title: '',
  post_date: '',
  reading_time: '',
  content: '',
  content_sources: [],
  reference_pic_url: '',
  reference_pic_name: '',
  additional_content: [],
  quote: '',
  quote_author: '',
  created_at: '',
};

const AdminPosts: React.FC<AdminPostsProps> = ({ initialPosts, error: initialError }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [formData, setFormData] = useState<Post>(defaultFormData);
  const [editId, setEditId] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState('');
  const [referencePreview, setReferencePreview] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if(initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'featured_image' | 'reference_pic_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      if (!data || !data.publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }
      
      const imageUrl = data.publicUrl;

        setFormData(prev => ({
          ...prev,
        [type]: imageUrl,
        }));

      if (type === 'featured_image') {
        setFeaturedPreview(imageUrl);
      } else if (type === 'reference_pic_url') {
        setReferencePreview(imageUrl);
      }
      
      toast.success('Image uploaded successfully.');

    } catch (err: any) {
      console.error('Error uploading image to Supabase:', err);
      toast.error(err.message || 'Error uploading image');
    }
  };

  const handleAddSection = () => {
    setFormData(prev => ({
      ...prev,
      additional_content: [...prev.additional_content, { title: '', paragraph: '' }],
    }));
  };
  
  const handleSectionChange = (index: number, field: 'title' | 'paragraph', value: string) => {
    const updatedSections = [...formData.additional_content];
    updatedSections[index][field] = value;
    setFormData(prev => ({ ...prev, additional_content: updatedSections }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = sanitizePostPayload(formData);
      let response;

      if (editId) {
        // Update existing post
        const { error } = await supabase.from('posts').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Post updated successfully');
      } else {
        // Create new post
        const { error } = await supabase.from('posts').insert([payload]);
        if (error) throw error;
        toast.success('Post created successfully');
      }

      const { data: updatedPosts, error: fetchError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if(fetchError) {
        toast.error(fetchError.message);
      } else {
        setPosts(updatedPosts as Post[]);
      }
  
      setFormData(defaultFormData);
      setEditId(null);
      setIsModalOpen(false);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      console.error('Error saving post:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (post: Post) => {
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      featured_image: post.featured_image || '',
      published: post.published ?? false,
      published_at: post.published_at || '',
      type: post.type || '',
      content: post.content || '',
      reference_pic_url: post.reference_pic_url || '',
      reference_pic_name: post.reference_pic_name || '',
      author_name: post.author_name || '',
      author_job_title: post.author_job_title || '',
      post_date: post.post_date ? new Date(post.post_date).toISOString().split('T')[0] : '',
      reading_time: post.reading_time || '',
      content_sources: post.content_sources,
      additional_content: Array.isArray(post.additional_content) ? post.additional_content : JSON.parse(post.additional_content || '[]'), // Parse JSON string
      quote: post.quote || '',
      quote_author: post.quote_author || '',
      created_at: post.created_at || '',
    });
  
    setFeaturedPreview(post.featured_image || '');
    setReferencePreview(post.reference_pic_url || '');
  
    setEditId(post.id);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      
      const { data: updatedPosts, error: fetchError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if(fetchError) {
        toast.error(fetchError.message);
      } else {
        setPosts(updatedPosts as Post[]);
      }
      toast.success('Post deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete post';
      console.error('Error deleting post:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h1 className="text-2xl font-bold mb-4">Manage Posts (Bảng-tin)</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="mb-4">Loading…</div>}

<table className="min-w-full bg-white border shadow mb-8 text-center">
  <thead>
    <tr>
      <th className="py-2 px-4 border-b">Title</th>
      <th className="py-2 px-4 border-b">Published</th>
      <th className="py-2 px-4 border-b">Date</th>
      <th className="py-2 px-4 border-b">Actions</th>
    </tr>
  </thead>
  <tbody>
    {posts.map(post => (
      <tr key={post.id} className="hover:bg-gray-50">
        <td className="py-2 px-4 border-b">{post.title}</td>
        <td className="py-2 px-4 border-b">{post.published ? 'Yes' : 'No'}</td>
        <td className="py-2 px-4 border-b">
          {post.published_at
            ? new Date(post.published_at).toLocaleString()
            : '—'}
        </td>
        <td className="py-2 px-4 border-b">
          <button
            onClick={() => handleEdit(post)}
            className="mx-1 text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(post.id)}
            className="mx-1 text-red-500 hover:underline"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


      <button
        onClick={() => {
          setFormData(defaultFormData);
          setEditId(null);
          setFeaturedPreview(''); // Clear the featured image preview
          setReferencePreview(''); // Clear the reference image preview
          setIsModalOpen(true);
        }}
        className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition flex items-center justify-center fixed bottom-8 right-8"
        style={{ width: '50px', height: '50px' }}
      >
        +
      </button>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <h2 className="text-xl font-semibold mb-4">{editId ? 'Edit Post' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="border p-2 w-full rounded" required />
          <input type="text" placeholder="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="border p-2 w-full rounded" required />
        </div>
        <input type="text" placeholder="Summary" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="border p-2 w-full rounded" />
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <ReactQuill value={formData.content} onChange={val => setFormData({ ...formData, content: val })} theme="snow" className="rounded" />
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Featured Image</label>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'featured_image')} className="border p-2 w-full rounded" />
          {featuredPreview && (
            <img src={featuredPreview} alt="Featured Preview" className="max-h-40 object-cover rounded" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Type"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Author Name"
            value={formData.author_name}
            onChange={e => setFormData({ ...formData, author_name: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Author Job Title" value={formData.author_job_title} onChange={e => setFormData({ ...formData, author_job_title: e.target.value })} className="border p-2 w-full rounded" />
          <input type="date" placeholder="Post Date" value={formData.post_date} onChange={e => setFormData({ ...formData, post_date: e.target.value })} className="border p-2 w-full rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Reading Time" value={formData.reading_time} onChange={e => setFormData({ ...formData, reading_time: e.target.value })} className="border p-2 w-full rounded" />
          <input type="text" placeholder="Quote" value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })} className="border p-2 w-full rounded" />
        </div>
        <input type="text" placeholder="Quote Author" value={formData.quote_author} onChange={e => setFormData({ ...formData, quote_author: e.target.value })} className="border p-2 w-full rounded" />
        <div className="space-y-2">
          <label className="block font-medium">Reference Image</label>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'reference_pic_url')} className="border p-2 w-full rounded" />
          {referencePreview && (
            <img src={referencePreview} alt="Reference Preview" className="max-h-40 object-cover rounded" />
          )}
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Additional Content Sections</label>
          {formData.additional_content.map((section, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                placeholder="Section Title"
                value={section.title}
                onChange={e => handleSectionChange(index, 'title', e.target.value)}
                className="border p-2 w-full rounded"
              />
              <textarea
                placeholder="Section Paragraph"
                value={section.paragraph}
                onChange={e => handleSectionChange(index, 'paragraph', e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>
          ))}
          <button type="button" onClick={handleAddSection} className="text-blue-500 hover:underline">
            Add Section
          </button>
        </div>
        <div className="space-y-2">
  <label className="block font-medium">Content Sources</label>
  {formData.content_sources.map((source, index) => (
    <div key={index} className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Source URL"
        value={source}
        onChange={e => {
          const updatedSources = [...formData.content_sources];
          updatedSources[index] = e.target.value;
          setFormData(prev => ({ ...prev, content_sources: updatedSources }));
        }}
        className="border p-2 w-full rounded"
      />
      <button
        type="button"
        onClick={() => {
          const updatedSources = formData.content_sources.filter((_, i) => i !== index);
          setFormData(prev => ({ ...prev, content_sources: updatedSources }));
        }}
        className="text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() => setFormData(prev => ({ ...prev, content_sources: [...prev.content_sources, ''] }))}
    className="text-blue-500 hover:underline"
  >
    Add Source
  </button>
</div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={e => setFormData({ ...formData, published: e.target.checked })}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">Publish</label>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
            {editId ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      props: {
        initialPosts: data || [],
      },
    };
  } catch (err: any) {
    return {
      props: {
        initialPosts: [],
        error: 'Failed to fetch posts from the server.',
      },
    };
  }
};

export default withAuth(AdminPosts);