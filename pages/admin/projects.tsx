import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout_admin from '../../components/Layout_admin';
import axios from 'axios';
import useSWR from 'swr';
import Modal from '../../components/Modal';
import dynamic from 'next/dynamic';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axiosInstance from '../../lib/axiosInstance';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const ProjectPreview = dynamic(() => import('../../components/ProjectPreview'), { ssr: false });

const fetcher = async (url: string) => {
  try {
    const fullUrl = url.startsWith('http') ? url : `${API}${url}`;
    const response = await axiosInstance.get(fullUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error: Unable to connect to the server');
      } else if (error.response?.status === 401) {
        toast.error('Authentication error: Please log in again');
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
  const { data: projects, mutate } = useSWR<ProjectForm[]>(`${API}/projects`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    title: '', slug: '', type: '', description: '', category: '', thumbnail: '', blocks: [], team: []
  });
  const [previewData, setPreviewData] = useState<ProjectForm | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [blockUploadProgress, setBlockUploadProgress] = useState<{ [idx: number]: number }>({});

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
        await axiosInstance.put(`${API}/projects/${formData.id}`, updateData);
      } else {
        // Ensure slug and type are included and are strings
        const { slug, type, ...newProjectData } = formData;
        console.log('New project data:', { ...newProjectData, slug: slug || '', type: type || '' });
        await axiosInstance.post(`${API}/projects`, { ...newProjectData, slug: slug || '', type: type || '' });
      }
      await mutate();
      setShowForm(false);
    } catch (error: any) {
      console.error('Save project failed:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please check your authentication token.');
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
      console.log('Deleting project with id:', id);
      await axiosInstance.delete(`${API}/projects/${id}`);
      mutate(); // Refresh list
    } catch (error: any) {
      console.error('Delete project failed:', error.response?.data || error.message);
  
      if (error.response?.status === 404) {
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
    const fd = new FormData();
    fd.append('file', file);
  
    try {
      const res = await axios.post('/api/upload', fd, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
      setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
      setUploadProgress(0); // Reset after success
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      alert('Thumbnail upload failed.');
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
    const fd = new FormData();
    fd.append('file', file);
  
    try {
      const res = await axios.post('/api/upload', fd, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: percent }));
        }
      });
  
      if (imgIdx !== undefined) {
        // Update specific image in side_by_side_image block
        const updatedImages = [...(formData.blocks[blockIdx].data?.images || [])];
        updatedImages[imgIdx].src = res.data.url;
        updateBlock(blockIdx, { ...formData.blocks[blockIdx], data: { images: updatedImages } });
      } else {
        // Update full_image block
        updateBlock(blockIdx, { ...formData.blocks[blockIdx], src: res.data.url });
      }
  
      setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: 0 }));
    } catch (err) {
      console.error('Block image upload failed:', err);
      alert('Block image upload failed.');
      setBlockUploadProgress(prev => ({ ...prev, [blockIdx]: 0 }));
    }
  };
  

  return (
    <Layout_admin>
      <h1 className="text-2xl font-bold mb-4">Manage Projects</h1>
      <button onClick={() => openForm()} className="mb-4 btn-blue">+ New Project</button>

      <table className="w-full table-auto mb-8">
        <thead><tr className="bg-gray-200"><th className="p-2 border">Title</th><th className="p-2 border">Slug</th><th className="p-2 border">Category</th><th className="p-2 border">Thumbnail</th><th className="p-2 border">Actions</th></tr></thead>
        <tbody>
          {projects?.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-2 border">{p.title}</td>
              <td className="p-2 border">{p.slug}</td>
              <td className="p-2 border">{p.category}</td>
              <td className="p-2 border">{p.thumbnail && <img src={p.thumbnail} className="h-12 w-12 object-cover" />}</td>
              <td className="p-2 border space-x-2">
                <button onClick={() => openForm(p)} className="btn-sm">Edit</button>
                <button onClick={() => deleteProject(p.id!)} className="btn-sm btn-red">Delete</button>
                <button onClick={() => setPreviewData(p)} className="btn-sm btn-gray">Preview</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={formData.id ? 'Edit Project' : 'New Project'}>
  <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 max-h-[90vh] overflow-y-auto w-full lg:w-[95vw]">
    {/* Form Section */}
    <div className="flex-1 space-y-4 overflow-y-auto">
      {/* Title */}
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        className="input w-full"
      />

      {/* Slug */}
      <input
        type="text"
        placeholder="Slug"
        value={formData.slug}
        onChange={e => setFormData({ ...formData, slug: e.target.value })}
        className="input w-full"
      />

      {/* Type */}
      <input
        type="text"
        placeholder="Type"
        value={formData.type}
        onChange={e => setFormData({ ...formData, type: e.target.value })}
        className="input w-full"
      />

      {/* Description */}
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        className="input w-full h-24"
      />

      {/* Category */}
      <input
        type="text"
        placeholder="Category"
        value={formData.category}
        onChange={e => setFormData({ ...formData, category: e.target.value })}
        className="input w-full"
      />

      {/* Thumbnail upload */}
      <div>
  <label className="block mb-2 font-semibold">Thumbnail</label>
  {formData.thumbnail && <img src={formData.thumbnail} className="h-50 w-full object-cover mb-2" />} {/* Increased size */}
  <input type="file" onChange={handleThumbnailUpload} />
  {uploadProgress > 0 && (
    <div className="w-full bg-gray-200 rounded mt-2">
      <div
        className="bg-blue-500 text-xs font-bold text-center text-white rounded"
        style={{ width: `${uploadProgress}%` }}
      >
        {uploadProgress}%
      </div>
    </div>
  )}
</div>

      {/* Team members */}
      <div>
        <label className="block mb-2 font-semibold">Team</label>
        {formData.team.map((member, idx) => (
          <div key={idx} className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={e => {
                const team = [...formData.team];
                team[idx].name = e.target.value;
                setFormData({ ...formData, team });
              }}
              className="input flex-1"
            />
            <input
              type="text"
              placeholder="Role"
              value={member.role}
              onChange={e => {
                const team = [...formData.team];
                team[idx].role = e.target.value;
                setFormData({ ...formData, team });
              }}
              className="input flex-1"
            />
            <button onClick={() => setFormData(prev => ({
              ...prev,
              team: prev.team.filter((_, i) => i !== idx)
            }))} className="btn-sm btn-red">Remove</button>
          </div>
        ))}
        <button onClick={() => setFormData(prev => ({
          ...prev,
          team: [...prev.team, { name: '', role: '' }]
        }))} className="btn-sm">+ Add Team Member</button>
      </div>

      {/* Content Blocks */}
      <div>
        <label className="block mb-2 font-semibold">Content Blocks</label>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {formData.blocks.map((block, idx) => (
                  <Draggable draggableId={String(idx)} index={idx} key={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="block-editor p-4 mb-4 border rounded bg-gray-100"
                      >
                        <div {...provided.dragHandleProps} className="cursor-move text-gray-400 hover:text-black mb-2">
                          🟰 Drag
                        </div>
                        <select value={block.type} onChange={e => changeBlockType(idx, e.target.value)} className="input w-full mb-2">
                          <option value="text">Text</option>
                          <option value="full_image">Full Image</option>
                          <option value="side_by_side_image">Side-by-Side Image</option>
                          <option value="text_and_side_image">Text + Side Image</option>
                          <option value="three_grid_layout">Three Grid Layout</option>
                        </select>

                        {blockUploadProgress[idx] > 0 && (
                          <div className="w-full bg-gray-200 rounded mt-2">
                            <div
                              className="bg-green-500 text-xs font-bold text-center text-white rounded"
                              style={{ width: `${blockUploadProgress[idx]}%` }}
                            >
                              {blockUploadProgress[idx]}%
                            </div>
                          </div>
                        )}

                        {renderBlockFields(idx, block)}

                        <button onClick={() => removeBlock(idx)} className="btn-sm btn-red mt-2">🗑 Remove</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button onClick={addBlock} className="btn-sm mt-2">+ Add Block</button>
      </div>

      <button onClick={saveProject} className="btn-blue w-full mt-4">
        Save Project
      </button>
      <button onClick={() => setShowForm(false)} className="btn-red w-full mt-2">
        Cancel
      </button>
    </div>

    {/* Preview Section */}
    {formData.id && (
      <div className="flex-1 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <ProjectPreview data={formData} />
      </div>
    )}
  </div>
</Modal>
)}


      {previewData && (
        <Modal onClose={() => setPreviewData(null)} title="Preview Project">
          <ProjectPreview data={previewData} />
        </Modal>
      )}
    </Layout_admin>
  );
};

export default withAuth(AdminProjects);
