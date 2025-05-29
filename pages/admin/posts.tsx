import { useState, useEffect } from 'react';
import AdminLayout from '@/components/Layout_admin'
import { withAuth } from '../../components/withAuth';
import { toast, ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

function sanitizePostPayload(data: Partial<Post>) {
  return {
    title: data.title || '',
    slug: data.slug || '',
    summary: data.summary || '',
    featuredImage: data.featuredImage || '',
    published: data.published ?? false,
    publishedAt: data.published ? new Date().toISOString() : null,
    content: data.content || '',
    referencePicUrl: data.referencePicUrl || '',
    referencePicName: data.referencePicName || '',
    authorName: data.authorName || '',
    authorJobTitle: data.authorJobTitle || '',
    postDate: data.postDate ? new Date(data.postDate).toISOString() : null,
    readingTime: data.readingTime || '',
    contentSources: Array.isArray(data.contentSources)
      ? data.contentSources
      : [],
    additionalContent: JSON.stringify(data.additionalContent ?? []), // Serialize to JSON string
    quote: data.quote || '',
    quoteAuthor: data.quoteAuthor || '',
    type: data.type || '',
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  published: boolean;
  publishedAt: string;
  type: string;
  authorName: string;
  authorJobTitle: string;
  postDate: string;
  readingTime: string;
  content: string;
  contentSources: string[];
  referencePicUrl: string;
  referencePicName: string;
  additionalContent: { title: string; paragraph: string }[];
  quote: string;
  quoteAuthor: string;
}

const defaultFormData: Post = {
  id: '',
  title: '',
  slug: '',
  summary: '',
  featuredImage: '',
  published: false,
  publishedAt: '',
  type: '',
  authorName: '',
  authorJobTitle: '',
  postDate: '',
  readingTime: '',
  content: '',
  contentSources: [],
  referencePicUrl: '',
  referencePicName: '',
  additionalContent: [],
  quote: '',
  quoteAuthor: '',
};

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Post>(defaultFormData);
  const [editId, setEditId] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState('');
  const [referencePreview, setReferencePreview] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('No token found, user is not authenticated');
      toast.error('You are not authenticated. Please log in.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorRes = await res.json();
        console.error('Failed to fetch posts:', errorRes);
        toast.error(errorRes.message || 'Failed to fetch posts');
        return;
      }

      const data: Post[] = await res.json();
      // Deserialize additionalContent from JSON string to array
      const parsedData = data.map(post => ({
        ...post,
        additionalContent: Array.isArray(post.additionalContent) ? post.additionalContent : JSON.parse(post.additionalContent || '[]'),
      }));
      setPosts(parsedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'featuredImage' | 'referencePicUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success('Image uploaded');
        setFormData(prev => ({
          ...prev,
          [type]: data.url,
        }));
        if (type === 'featuredImage') setFeaturedPreview(data.url);
        if (type === 'referencePicUrl') setReferencePreview(data.url);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image');
    }
  };

  const handleAddSection = () => {
    setFormData(prev => ({
      ...prev,
      additionalContent: [...prev.additionalContent, { title: '', paragraph: '' }],
    }));
  };
  
  const handleSectionChange = (index: number, field: 'title' | 'paragraph', value: string) => {
    const updatedSections = [...formData.additionalContent];
    updatedSections[index][field] = value;
    setFormData(prev => ({ ...prev, additionalContent: updatedSections }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');
  
      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/api/posts/${editId}` : `/api/posts`;
      const payload  = sanitizePostPayload(formData);
  
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        // <-- Replace your throw block with this:
        const errorData = await res.json().catch(() => ({}));
        const message =
          typeof errorData.message === 'string'
            ? errorData.message
            : errorData.message
            ? JSON.stringify(errorData.message)
            : JSON.stringify(errorData) || 'Unknown error';
        throw new Error(message);
      }
  
      await fetchPosts();
      setFormData(defaultFormData);
      setEditId(null);
      setIsModalOpen(false);
      toast.success(editId ? 'Post updated successfully' : 'Post created successfully');
    } catch (err) {
      console.error('Error saving post:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  

  const handleEdit = (post: Post) => {
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      featuredImage: post.featuredImage || '',
      published: post.published ?? false,
      publishedAt: post.publishedAt || '',
      type: post.type || '',
      content: post.content || '',
      referencePicUrl: post.referencePicUrl || '',
      referencePicName: post.referencePicName || '',
      authorName: post.authorName || '',
      authorJobTitle: post.authorJobTitle || '',
      postDate: post.postDate || '',
      readingTime: post.readingTime || '',
      contentSources: post.contentSources,
      additionalContent: Array.isArray(post.additionalContent) ? post.additionalContent : JSON.parse(post.additionalContent || '[]'), // Parse JSON string
      quote: post.quote || '',
      quoteAuthor: post.quoteAuthor || '',
    });
  
    setFeaturedPreview(post.featuredImage || '');
    setReferencePreview(post.referencePicUrl || '');
  
    setEditId(post.id);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete post');
      await fetchPosts();
    } catch (err) {
      setError('Failed to delete post');
      toast.error('Failed to delete post');
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
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleString()
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
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'featuredImage')} className="border p-2 w-full rounded" />
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
            value={formData.authorName}
            onChange={e => setFormData({ ...formData, authorName: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Author Job Title" value={formData.authorJobTitle} onChange={e => setFormData({ ...formData, authorJobTitle: e.target.value })} className="border p-2 w-full rounded" />
          <input type="date" placeholder="Post Date" value={formData.postDate} onChange={e => setFormData({ ...formData, postDate: e.target.value })} className="border p-2 w-full rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Reading Time" value={formData.readingTime} onChange={e => setFormData({ ...formData, readingTime: e.target.value })} className="border p-2 w-full rounded" />
          <input type="text" placeholder="Quote" value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })} className="border p-2 w-full rounded" />
        </div>
        <input type="text" placeholder="Quote Author" value={formData.quoteAuthor} onChange={e => setFormData({ ...formData, quoteAuthor: e.target.value })} className="border p-2 w-full rounded" />
        <div className="space-y-2">
          <label className="block font-medium">Reference Image</label>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'referencePicUrl')} className="border p-2 w-full rounded" />
          {referencePreview && (
            <img src={referencePreview} alt="Reference Preview" className="max-h-40 object-cover rounded" />
          )}
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Additional Content Sections</label>
          {formData.additionalContent.map((section, index) => (
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
  {formData.contentSources.map((source, index) => (
    <div key={index} className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Source URL"
        value={source}
        onChange={e => {
          const updatedSources = [...formData.contentSources];
          updatedSources[index] = e.target.value;
          setFormData(prev => ({ ...prev, contentSources: updatedSources }));
        }}
        className="border p-2 w-full rounded"
      />
      <button
        type="button"
        onClick={() => {
          const updatedSources = formData.contentSources.filter((_, i) => i !== index);
          setFormData(prev => ({ ...prev, contentSources: updatedSources }));
        }}
        className="text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() => setFormData(prev => ({ ...prev, contentSources: [...prev.contentSources, ''] }))}
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

export default withAuth(AdminPosts);