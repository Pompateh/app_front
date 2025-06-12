import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout_admin from '../../components/Layout_admin';
import axios from 'axios';
import { useSWR } from 'swr';
import Modal from '../../components/Modal';
import dynamic from 'next/dynamic';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axiosInstance from '../../lib/axiosInstance';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com/api';
const ProjectPreview = dynamic(() => import('../../components/ProjectPreview'), { ssr: false });

const fetcher = async (url: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const fullUrl = url.startsWith('http') ? url : `${API}/admin${url}`;
    const response = await axiosInstance.get(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error: Unable to connect to the server');
      } else if (error.response?.status === 401) {
        toast.error('Authentication error: Please log in again');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      } else {
        toast.error(error.response?.data?.message || 'Error fetching data');
      }
    } else {
      toast.error('An unexpected error occurred');
    }
    throw error;
  }
};

interface ContentBlockForm {
  id?: string;
  type: string;
  layout?: 'left' | 'right';
  src?: string;
  alt?: string;
  text?: string;
  data?: any;
}

interface ProjectForm {
  id?: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  category: string;
  thumbnail?: string;
  blocks: ContentBlockForm[];
  team: { name: string; role: string }[];
}

const AdminProjects: React.FC = () => {
  const { data: projects, mutate } = useSWR<ProjectForm[]>('/projects', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    title: '', slug: '', type: '', description: '', category: '', thumbnail: '', blocks: [], team: []
  });
  const [previewData, setPreviewData] = useState<ProjectForm | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [blockUploadProgress, setBlockUploadProgress] = useState<{ [idx: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(formData.blocks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
  
    // Validate block types
    const validBlockTypes = ['text', 'full_image', 'side_by_side_image', 'text_and_side_image', 'three_grid_layout'];
    const isValid = reordered.every(block => validBlockTypes.includes(block.type));
  
    if (isValid) {
      setFormData({ ...formData, blocks: reordered });
    } else {
      console.error('Invalid block type detected during drag-and-drop operation.');
    }
  };

  const openForm = (project?: ProjectForm) => {
    if (project) {
      // Normalize "image" blocks to "full_image"
      const normalizedBlocks = project.blocks.map(block => {
        if (block.type === 'image') {
          return { ...block, type: 'full_image' };
        }
        return block;
      });
  
      setFormData({
        id: project.id,
        title: project.title || '',
        slug: project.slug || '',
        type: project.type || '',
        description: project.description || '',
        category: project.category || '',
        thumbnail: project.thumbnail || '',
        blocks: normalizedBlocks,
        team: project.team || [],
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        type: '',
        description: '',
        category: '',
        thumbnail: '',
        blocks: [],
        team: [],
      });
    }
    setShowForm(true);
  };
  
  const saveProject = async () => {
    console.log('Saving project:', formData);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update valid block types to include 'image' if it's a valid type
      const validBlockTypes = ['text', 'full_image', 'side_by_side_image', 'text_and_side_image', 'three_grid_layout'];
      const isValid = formData.blocks.every(block => validBlockTypes.includes(block.type));
  
      if (!isValid) {
        console.error('Invalid block type detected:', formData.blocks);
        throw new Error('Invalid block type detected. Please ensure all blocks have a valid type.');
      }
  
      if (formData.id) {
        const { id, slug, type, blocks, team, ...rest } = formData;
  
        // Clean blocks
        const cleanedBlocks = (blocks as any[]).map((block) => {
          const { id, projectId, ...blockRest } = block;
          return blockRest;
        });
  
        // Clean team
        const cleanedTeam = (team as any[]).map((member) => {
          const { id, projectId, ...teamRest } = member;
          return teamRest;
        });
  
        // Prepare update data without slug and type
        const updateData = {
          ...rest,
          blocks: cleanedBlocks,
          team: cleanedTeam,
        };
  
        console.log('Update data:', updateData);
        await axiosInstance.put(`${API}/admin/projects/${formData.id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      } else {
        // Ensure slug and type are included and are strings
        const { slug, type, ...newProjectData } = formData;
        console.log('New project data:', { ...newProjectData, slug: slug || '', type: type || '' });
        await axiosInstance.post(`${API}/admin/projects`, { ...newProjectData, slug: slug || '', type: type || '' }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      }
      await mutate();
      setShowForm(false);
    } catch (error: any) {
      console.error('Save project failed:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please check your authentication token.');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      } else if (error.response?.status === 400) {
        console.error('Bad Request:', error.response.data);
        toast.error(`Save failed: ${error.response.data.message || 'Invalid request data.'}`);
      } else {
        toast.error(`Save failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };
  const deleteProject = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) return; // stop if user cancels
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Deleting project with id:', id);
      await axiosInstance.delete(`${API}/admin/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      mutate(); // Refresh list
    } catch (error: any) {
      console.error('Delete project failed:', error.response?.data || error.message);
  
      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please check your authentication token.');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      } else if (error.response?.status === 404) {
        toast.error('Project not found or already deleted.');
      } else {
        toast.error(`Delete failed: ${error.response?.data?.message || error.message}`);
      }
      
      mutate();
    }
  };
  
  
  
  const addBlock = () => {
    setFormData(prev => ({ ...prev, blocks: [...prev.blocks, { type: 'text', layout: 'left', text: '' }] }));
  };
  const updateBlock = (idx: number, block: ContentBlockForm) => {
    const blocks = [...formData.blocks];
    blocks[idx] = block;
    setFormData({ ...formData, blocks });
  };
  const removeBlock = (idx: number) => {
    setFormData({ ...formData, blocks: formData.blocks.filter((_, i) => i !== idx) });
  };

  

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found');
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
  
    try {
      const res = await axios.post(`${API}/admin/upload`, fd, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
      setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
      setUploadProgress(0); // Reset after success
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      toast.error('Thumbnail upload failed.');
      setUploadProgress(0);
    }
  };
  

  const changeBlockType = (idx: number, type: string) => {
    const blocks = [...formData.blocks];
    switch (type) {
      case 'text':
        blocks[idx] = { type: 'text', text: '', layout: 'left' };
        break;
      case 'full_image':
        blocks[idx] = { type: 'full_image', src: '', alt: '' };
        break;
      case 'side_by_side_image':
        blocks[idx] = { type: 'side_by_side_image', data: { images: [] } };
        break;
      case 'text_and_side_image':
        blocks[idx] = { type: 'text_and_side_image', data: { text: '', image: { src: '', alt: '', layout: 'left' } } };
        break;
      case 'three_grid_layout':
        blocks[idx] = { type: 'three_grid_layout', data: { items: [] } };
        break;
    }
    setFormData({ ...formData, blocks });
  };
  
  const moveBlockUp = (idx: number) => {
    if (idx === 0) return;
    const blocks = [...formData.blocks];
    [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]];
    setFormData({ ...formData, blocks });
  };
  
  const moveBlockDown = (idx: number) => {
    if (idx === formData.blocks.length - 1) return;
    const blocks = [...formData.blocks];
    [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
    setFormData({ ...formData, blocks });
  };

  const renderBlockFields = (idx: number, block: ContentBlockForm) => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <select
              value={block.layout || 'left'}
              onChange={e => updateBlock(idx, { ...block, layout: e.target.value as 'left' | 'right' })}
              className="input w-full mb-2"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <textarea
              value={block.text || ''}
              onChange={e => updateBlock(idx, { ...block, text: e.target.value })}
              className="input w-full"
              placeholder="Enter text"
            />
          </>
        );
  
      case 'full_image':
        return (
          <>
            {block.src && <img src={block.src} className="w-full h-auto mb-2" />}
            {!block.src && <input type="file" onChange={e => handleBlockImageUpload(idx, e)} />}
            <input
              type="text"
              placeholder="Alt text"
              value={block.alt || ''}
              onChange={e => updateBlock(idx, { ...block, alt: e.target.value })}
              className="input w-full mt-2"
            />
          </>
        );
  
        case 'side_by_side_image':
          return (
            <>
              {(block.data?.images || []).map((img: { src: string; layout: 'left' | 'right'; alt?: string }, imgIdx: number) => (
                <div key={imgIdx} className="flex items-center space-x-2 mb-2">
                  {!img.src && (
                    <input
                      type="file"
                      onChange={e => handleBlockImageUpload(idx, e, imgIdx)}
                      className="input flex-1"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={img.src}
                    onChange={e => {
                      const updated = [...(block.data?.images || [])];
                      updated[imgIdx].src = e.target.value;
                      updateBlock(idx, { ...block, data: { images: updated } });
                    }}
                    className="input flex-1"
                  />
                  <select
                    value={img.layout}
                    onChange={e => {
                      const updated = [...(block.data?.images || [])];
                      updated[imgIdx].layout = e.target.value as 'left' | 'right';
                      updateBlock(idx, { ...block, data: { images: updated } });
                    }}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                  <button
                    className="btn-sm btn-red"
                    onClick={() => {
                      const updated = (block.data?.images || []).filter((_: any, i: number) => i !== imgIdx);
                      updateBlock(idx, { ...block, data: { images: updated } });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateBlock(idx, {
                  ...block,
                  data: { images: [...(block.data?.images || []), { src: '', layout: 'left' }] }
                })}
                className="btn-sm"
                disabled={(block.data?.images || []).length >= 2} // Assuming a limit of 2 for side-by-side
              >
                + Add Image
              </button>
            </>
          );
  
      case 'text_and_side_image':
        return (
          <>
            <textarea
              placeholder="Text content"
              value={block.data?.text || ''}
              onChange={e => updateBlock(idx, {
                ...block,
                data: { ...block.data, text: e.target.value }
              })}
              className="input w-full mb-2"
            />
            {!block.data?.image?.src && (
              <input
                type="file"
                onChange={e => handleBlockImageUpload(idx, e)}
                className="input w-full"
              />
            )}
            <input
              type="text"
              placeholder="Image URL"
              value={block.data?.image?.src || ''}
              onChange={e => updateBlock(idx, {
                ...block,
                data: { ...block.data, image: { ...(block.data?.image || {}), src: e.target.value } }
              })}
              className="input w-full"
            />
            <select
              value={block.data?.image?.layout || 'left'}
              onChange={e => updateBlock(idx, {
                ...block,
                data: { ...block.data, image: { ...(block.data?.image || {}), layout: e.target.value as 'left' | 'right' } }
              })}
              className="input w-full mt-2"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </>
        );
  
      case 'three_grid_layout':
        return (
          <>
            {(block.data?.items || []).map((item: { type: 'text' | 'image'; text?: string; src?: string }, itemIdx: number) => (
              <div key={itemIdx} className="flex items-center space-x-2 mb-2">
                <select
                  value={item.type}
                  onChange={e => {
                    const updated = [...(block.data?.items || [])];
                    updated[itemIdx].type = e.target.value as 'text' | 'image';
                    updateBlock(idx, { ...block, data: { items: updated } });
                  }}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                </select>
  
                {item.type === 'text' ? (
                  <input
                    type="text"
                    placeholder="Text"
                    value={item.text || ''}
                    onChange={e => {
                      const updated = [...(block.data?.items || [])];
                      updated[itemIdx].text = e.target.value;
                      updateBlock(idx, { ...block, data: { items: updated } });
                    }}
                    className="input flex-1"
                  />
                ) : (
                  <>
                    {!item.src && (
                      <input
                        type="file"
                        onChange={e => handleBlockImageUpload(idx, e)}
                        className="input flex-1"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={item.src || ''}
                      onChange={e => {
                        const updated = [...(block.data?.items || [])];
                        updated[itemIdx].src = e.target.value;
                        updateBlock(idx, { ...block, data: { items: updated } });
                      }}
                      className="input flex-1"
                    />
                  </>
                )}
                <button
                  className="btn-sm btn-red"
                  onClick={() => {
                    const updated = (block.data?.items || []).filter((_: any, i: number) => i !== itemIdx);
                    updateBlock(idx, { ...block, data: { items: updated } });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => updateBlock(idx, {
                ...block,
                data: { items: [...(block.data?.items || []), { type: 'text', text: '', layout: 'left' }] }
              })}
              className="btn-sm"
              disabled={(block.data?.items || []).length >= 3}
            >
              + Add Item
            </button>
          </>
        );
  
      default:
        return <div>Unknown block type</div>;
    }
  };
  const handleBlockImageUpload = async (blockIdx: number, e: React.ChangeEvent<HTMLInputElement>, imgIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found');
      return;
    }

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await axios.post(`${API}/admin/upload`, fd, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: percent }));
        }
      });

      const blocks = [...formData.blocks];
      if (imgIdx !== undefined) {
        // Update specific image in side_by_side_image or three_grid_layout
        if (blocks[blockIdx].type === 'side_by_side_image' || blocks[blockIdx].type === 'three_grid_layout') {
          const images = [...(blocks[blockIdx].data?.images || [])];
          images[imgIdx] = res.data.url;
          blocks[blockIdx] = {
            ...blocks[blockIdx],
            data: { ...blocks[blockIdx].data, images }
          };
        }
      } else {
        // Update single image
        blocks[blockIdx] = {
          ...blocks[blockIdx],
          src: res.data.url
        };
      }
      setFormData(prev => ({ ...prev, blocks }));
      setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: 0 }));
    } catch (err) {
      console.error('Block image upload failed:', err);
      toast.error('Block image upload failed.');
      setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: 0 }));
    }
  };
  
  const handleTeamMemberChange = (index: number, field: 'name' | 'role', value: string) => {
    const updatedTeam = [...formData.team];
    updatedTeam[index] = { ...updatedTeam[index], [field]: value };
    setFormData(prev => ({ ...prev, team: updatedTeam }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', role: '' }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  };

  return (
    <Layout_admin>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button onClick={() => openForm()} className="btn-primary">
            Add New Project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{project.category}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => openForm(project)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProject(project.id!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <Modal
            onClose={() => setShowForm(false)}
            title={formData.id ? 'Edit Project' : 'Add New Project'}
          >
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); saveProject(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                    <input
                      type="file"
                      onChange={handleThumbnailUpload}
                      className="mt-1 block w-full"
                      accept="image/*"
                    />
                    {uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {formData.thumbnail && (
                      <div className="mt-2">
                        <img
                          src={formData.thumbnail}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                    <div className="space-y-2">
                      {formData.team.map((member, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={member.name}
                            onChange={e => handleTeamMemberChange(idx, 'name', e.target.value)}
                            className="input flex-1"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={member.role}
                            onChange={e => handleTeamMemberChange(idx, 'role', e.target.value)}
                            className="input flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeTeamMember(idx)}
                            className="btn-sm btn-red"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="btn-sm"
                      >
                        + Add Team Member
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Blocks</label>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="blocks">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {formData.blocks.map((block, idx) => (
                              <Draggable key={idx} draggableId={`block-${idx}`} index={idx}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-gray-50 p-4 rounded-lg"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <select
                                        value={block.type}
                                        onChange={(e) => {
                                          const blocks = [...formData.blocks];
                                          blocks[idx] = { ...blocks[idx], type: e.target.value };
                                          setFormData({ ...formData, blocks });
                                        }}
                                        className="input"
                                      >
                                        <option value="text">Text</option>
                                        <option value="full_image">Full Image</option>
                                        <option value="side_by_side_image">Side by Side Images</option>
                                        <option value="text_and_side_image">Text and Side Image</option>
                                        <option value="three_grid_layout">Three Grid Layout</option>
                                      </select>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => removeBlock(idx)}
                                          className="btn-sm btn-red"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                    {renderBlockFields(idx, block)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <button
                      type="button"
                      onClick={addBlock}
                      className="btn-sm mt-2"
                    >
                      + Add Block
                    </button>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {formData.id ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {previewData && (
          <Modal
            onClose={() => setPreviewData(null)}
            title="Project Preview"
          >
            <div className="p-6">
              <ProjectPreview data={previewData} />
            </div>
          </Modal>
        )}
      </div>
    </Layout_admin>
  );
};

export default withAuth(AdminProjects);
