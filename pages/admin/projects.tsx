import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import Modal from '../../components/Modal';
import dynamic from 'next/dynamic';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '../../lib/supabaseClient';
import Layout_admin from '../../components/Layout_admin';
import { GetServerSideProps } from 'next';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';


const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
const ProjectPreview = dynamic(() => import('../../components/ProjectPreview'), { ssr: false });


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

interface AdminProjectsProps {
  initialProjects: ProjectForm[];
  error?: string;
}

const quillToolbarOptions = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean']
];

const quillModules = {
  toolbar: quillToolbarOptions,
};

const AdminProjects: React.FC<AdminProjectsProps> = ({ initialProjects, error: initialError }) => {
  const [projects, setProjects] = useState<ProjectForm[]>(initialProjects);
  const [error, setError] = useState<string | undefined>(initialError);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    title: '', slug: '', type: '', description: '', category: '', thumbnail: '', blocks: [], team: []
  });
  const [previewData, setPreviewData] = useState<ProjectForm | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [blockUploadProgress, setBlockUploadProgress] = useState<{ [idx: number]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialError) {
      alert(`Error loading projects: ${initialError}`);
    }
  }, [initialError]);

  const mutate = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, blocks(*), team(*)')
      .order('created_at');
    if (error) {
      setError(error.message);
      alert(`Error fetching projects: ${error.message}`);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

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
      setFormData({
        id: project.id,
        title: project.title || '',
        slug: project.slug || '',
        type: project.type || '',
        description: project.description || '',
        category: project.category || '',
        thumbnail: project.thumbnail || '',
        blocks: project.blocks || [],
        team: project.team || [],
      });
    } else {
      setFormData({
        title: '',
        slug: '', // Ensure slug is initialized as an empty string
        type: '', // Ensure type is initialized as an empty string
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
    const { id, blocks, team, ...projectData } = formData;

    // Remove id and created_at from blocks before insert/update (ignore TS error)
    const cleanedBlocks = blocks.map((block) => {
      const { id, created_at, ...rest } = block as any;
      return rest;
    });

    try {
      if (id) {
        // Update project
        const { error: projectError } = await supabase
          .from('projects')
          .update(projectData)
          .match({ id });
        if (projectError) throw projectError;

        // Easiest way to handle relations is to delete and re-insert
        await supabase.from('team').delete().match({ project_id: id });
        await supabase.from('blocks').delete().match({ project_id: id });

        if (team.length > 0) {
          const teamToInsert = team.map(t => ({ ...t, project_id: id }));
          const { error: teamError } = await supabase.from('team').insert(teamToInsert);
          if (teamError) throw teamError;
        }

        if (cleanedBlocks.length > 0) {
            const blocksToInsert = cleanedBlocks.map(b => ({ ...b, project_id: id }));
            const { error: blocksError } = await supabase.from('blocks').insert(blocksToInsert);
            if (blocksError) throw blocksError;
        }

      } else {
        // Create project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();

        if (projectError) throw projectError;
        if (!newProject) throw new Error("Project creation failed");

        const newProjectId = newProject.id;
        
        if (team.length > 0) {
            const teamToInsert = team.map(t => ({ ...t, project_id: newProjectId }));
            const { error: teamError } = await supabase.from('team').insert(teamToInsert);
            if (teamError) throw teamError;
        }
        
        if (cleanedBlocks.length > 0) {
            const blocksToInsert = cleanedBlocks.map(b => ({ ...b, project_id: newProjectId }));
            const { error: blocksError } = await supabase.from('blocks').insert(blocksToInsert);
            if (blocksError) throw blocksError;
        }
      }

      await mutate();
      setShowForm(false);
    } catch (error: any) {
      console.error('Save project failed:', error.message);
      alert(`Save failed: ${error.message}`);
    }
  };
  const deleteProject = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) return;
  
    try {
      // First, delete related data if your RLS policies require it or cascades are not set up.
      // Depending on your DB schema, you may need to delete from 'team' and 'blocks' first.
      // This is a safeguard. If you have cascading deletes on your foreign keys, this is not strictly necessary.
      await supabase.from('team').delete().match({ project_id: id });
      await supabase.from('blocks').delete().match({ project_id: id });
      
      // Then delete the project itself
      const { error } = await supabase.from('projects').delete().match({ id });
      if (error) throw error;
      
      await mutate();
    } catch (error: any) {
      console.error('Delete project failed:', error.message);
      alert(`Delete failed: ${error.message}`);
      await mutate(); // Re-fetch data even if delete fails to get latest state
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

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`;
  
    try {
        const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail: publicUrlData.publicUrl }));
      setUploadProgress(0); // Reset after success
    } catch (err: any) {
      console.error('Thumbnail upload failed:', err.message);
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
    const commonFields = (
      <div className="flex items-center space-x-2">
        <select
          value={block.layout || 'left'}
          onChange={e => updateBlock(idx, { ...block, layout: e.target.value as 'left' | 'right' })}
          className="input w-full mb-2"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        <ReactQuill
          value={block.text || ''}
          onChange={val => updateBlock(idx, { ...block, text: val })}
          className="mb-2"
          theme="snow"
          modules={quillModules}
        />
        <button onClick={() => moveBlockUp(idx)} disabled={idx === 0}>Up</button>
        <button onClick={() => moveBlockDown(idx)} disabled={idx === formData.blocks.length - 1}>Down</button>
        <button onClick={() => removeBlock(idx)} className="text-red-500">Remove</button>
      </div>
    );

    switch (block.type) {
      case 'text':
        return commonFields;
  
      case 'full_image':
        return (
          <>
            {block.src && <img src={block.src} className="w-full h-auto mb-2" />}
            <input
              type="text"
              placeholder="Image URL"
              value={block.src || ''}
              onChange={e => updateBlock(idx, { ...block, src: e.target.value })}
              className="input w-full mb-2"
            />
            <input type="file" onChange={e => handleBlockImageUpload(idx, e)} />
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
                <input
                  type="file"
                  onChange={e => handleSideBySideImageUpload(idx, imgIdx, e)}
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
            >
              + Add Image
            </button>
          </>
        );
  
      case 'text_and_side_image':
        if (!block.data) {
          block.data = { text: '', src: '', alt: '', layout: 'left' };
        }
        return (
          <div key={idx}>
            {commonFields}
            <input
              type="text"
              placeholder="Image URL"
              value={block.data?.image?.src || ''}
              onChange={e => updateBlock(idx, {
                ...block,
                data: { ...block.data, image: { ...(block.data?.image || {}), src: e.target.value } }
              })}
              className="input w-full mb-2"
            />
            <input
              type="file"
              onChange={e => handleTextAndSideImageUpload(idx, e)}
              className="input w-full mb-2"
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
          </div>
        );
  
        case 'three_grid_layout':
          if (!block.data?.items) {
            block.data = { items: [{ src: '', alt: '' }, { src: '', alt: '' }, { src: '' }] };
          }
          return (
            <div key={idx}>
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
                    <div className="flex-1">
                      <ReactQuill
                        value={item.text || ''}
                        onChange={val => {
                          const updated = [...(block.data?.items || [])];
                          updated[itemIdx].text = val;
                          updateBlock(idx, { ...block, data: { items: updated } });
                        }}
                        className="mb-2"
                        theme="snow"
                        modules={quillModules}
                      />
                    </div>
                  ) : (
                    <>
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
                      <input
                        type="file"
                        onChange={e => handleThreeGridImageUpload(idx, itemIdx, e)}
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
              >
                + Add Item
              </button>
            </div>
          );
  
      default:
        return <div>Unknown block type</div>;
    }
  };
  
  

  const handleBlockImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      updateBlock(idx, { ...formData.blocks[idx], src: publicUrlData.publicUrl });
      setBlockUploadProgress(prev => ({ ...prev, [idx]: 0 }));
    } catch (err: any) {
      console.error('Block image upload failed:', err.message);
      alert('Block image upload failed.');
      setBlockUploadProgress(prev => ({ ...prev, [idx]: 0 }));
    }
  };
  
  // For side_by_side_image block
  const handleSideBySideImageUpload = async (blockIdx: number, imgIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);
      const block = formData.blocks[blockIdx];
      const images = [...(block.data?.images || [])];
      images[imgIdx].src = publicUrlData.publicUrl;
      updateBlock(blockIdx, { ...block, data: { ...block.data, images } });
    } catch (err: any) {
      alert('Image upload failed.');
    }
  };

  // For text_and_side_image block
  const handleTextAndSideImageUpload = async (blockIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);
      const block = formData.blocks[blockIdx];
      updateBlock(blockIdx, {
        ...block,
        data: {
          ...block.data,
          image: { ...(block.data?.image || {}), src: publicUrlData.publicUrl },
        },
      });
    } catch (err: any) {
      alert('Image upload failed.');
    }
  };

  // For three_grid_layout block
  const handleThreeGridImageUpload = async (blockIdx: number, itemIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);
      const block = formData.blocks[blockIdx];
      const items = [...(block.data?.items || [])];
      items[itemIdx].src = publicUrlData.publicUrl;
      updateBlock(blockIdx, { ...block, data: { ...block.data, items } });
    } catch (err: any) {
      alert('Image upload failed.');
    }
  };

  return (
    <Layout_admin>
      <h1 className="text-2xl font-bold mb-4">Manage Projects</h1>
      <button onClick={() => openForm()} className="mb-4 btn-blue">+ New Project</button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
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
        {formData.thumbnail && <img src={formData.thumbnail} className="h-16 w-16 object-cover mb-2" />}
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={formData.thumbnail || ''}
          onChange={e => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
          className="input w-full mb-2"
        />
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
    <div className="flex-1 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <ProjectPreview data={formData} />
    </div>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { data: initialProjects, error } = await supabase
    .from('projects')
    .select('*, blocks(*), team(*)')
    .order('created_at');

  if (error) {
    return {
      props: {
        initialProjects: [],
        error: error.message,
      },
    };
  }

  return {
    props: {
      initialProjects: initialProjects || [],
    },
  };
};

export default withAuth(AdminProjects);
