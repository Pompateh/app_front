import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout_admin from '../../components/Layout_admin';
import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';

interface NavItem {
  label: string;
  href: string;
}

interface FontItem {
  id?: string;
  name: string;
  image: string;
  type: string;
  price: number;
  studio_id?: string;
}

interface ArtworkItem {
  id?: string;
  name: string;
  author: string;
  image: string;
  type: string;
  studio_id?: string;
}

interface Studio {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  logo?: string;
  author?: string;
  imageTitle?: string;
  imageDescription?: string;
  openDays?: string[];
  openHours?: string;
  navigation?: NavItem[];
  slogan?: string;
  fonts?: FontItem[];
  artworks?: ArtworkItem[];
}

interface AdminStudiosProps {
  initialStudios: Studio[];
  error?: string;
}

const AdminStudios: React.FC<AdminStudiosProps> = ({ initialStudios, error: initialError }) => {
  const [studios, setStudios] = useState<Studio[]>(initialStudios);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(initialError || '');
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    thumbnail?: string;
    logo?: string;
    author?: string;
    imageTitle?: string;
    imageDescription?: string;
    openDays: string;
    openHours: string;
    navigation: NavItem[];
    slogan: string;
    fonts: FontItem[];
    artworks: ArtworkItem[];
  }>({
    name: '',
    description: '',
    thumbnail: '',
    logo: '',
    author: '',
    imageTitle: '',
    imageDescription: '',
    openDays: '',
    openHours: '',
    navigation: [],
    slogan: '',
    fonts: [],
    artworks: [],
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    if(initialError) {
      toast.error(initialError)
    }
  }, [initialError])

  const fetchStudios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('studios')
      .select(`*, fonts(*), artworks(*)`);
    
    if (error) {
      toast.error(error.message);
      setError(error.message);
    } else if (data) {
      setStudios(data);
    }
    setLoading(false);
  };

  // No need for useEffect to call fetchStudios on mount, getServerSideProps does that.

  const handleUpload = async (file: File) => {
    try {
      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/webm'];
      
      if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
        toast.error('Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM) file');
        return null;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return null;
      }

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      toast.info('Uploading file...');
      
      const { error: uploadError } = await supabase.storage
        .from('studio-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('studio-images')
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Could not get public URL for the uploaded file.');
      }

      toast.success('File uploaded successfully!');
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const MediaPreview = ({ url }: { url: string }) => {
    const isVideo = url.match(/\.(mp4|webm)$/i);
    
    if (isVideo) {
      return (
        <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
          <video 
            src={url}
            className="h-full w-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              Video
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <img
        src={url}
        alt="Media preview"
        className="h-20 w-20 object-cover rounded-md"
      />
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleUpload(file);
    if (url) {
      setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { fonts, artworks, ...studioData } = formData;
      const sanitizedOpenDays = studioData.openDays.split(',').map(day => day.trim()).filter(Boolean);
      const mainPayload = { ...studioData, openDays: sanitizedOpenDays };

      let studioId = editId;

      if (editId) {
        const { error: studioError } = await supabase.from('studios').update(mainPayload).eq('id', editId);
        if (studioError) throw studioError;
      } else {
        const { data: newStudio, error: studioError } = await supabase.from('studios').insert([mainPayload]).select().single();
        if (studioError) throw studioError;
        if (!newStudio) throw new Error("Failed to create studio.");
        studioId = newStudio.id;
      }

      if (!studioId) throw new Error("Studio ID is missing.");

      const processItems = async (items: any[], tableName: string) => {
        if (items.length === 0) return;
        const itemsToUpsert = items.map(({ id, ...item }) => ({
            ...(id && { id }), // Only include ID if it exists
            ...item,
            studio_id: studioId,
        }));

        const { error } = await supabase.from(tableName).upsert(itemsToUpsert);
        if (error) throw new Error(`Error saving ${tableName}: ${error.message}`);
      };

      await processItems(fonts, 'fonts');
      await processItems(artworks, 'artworks');

      toast.success(`Studio ${editId ? 'updated' : 'created'} successfully`);
      
      await fetchStudios();
      setFormData({
        name: '', description: '', thumbnail: '', logo: '', author: '',
        imageTitle: '', imageDescription: '', openDays: '', openHours: '',
        navigation: [], slogan: '', fonts: [], artworks: [],
      });
      setEditId(null);
      setShowForm(false);

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      console.error('Error saving studio:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleItemImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number,
  itemType: 'fonts' | 'artworks'
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = await handleUpload(file);
  if (url) {
    setFormData(prev => {
      const updatedItems = [...prev[itemType]];
      updatedItems[index].image = url;
      return { ...prev, [itemType]: updatedItems };
    });
  }
};

  const handleEdit = (studio: Studio) => {
    setFormData({
      name: studio.name,
      description: studio.description,
      thumbnail: studio.thumbnail || '',
      logo: studio.logo || '',
      author: studio.author || '',
      imageTitle: studio.imageTitle || '',
      imageDescription: studio.imageDescription || '',
      openDays: Array.isArray(studio.openDays) ? studio.openDays.join(', ') : studio.openDays || '',
      openHours: studio.openHours || '',
      navigation: Array.isArray(studio.navigation) ? studio.navigation : [],
      slogan: studio.slogan || '',
      fonts: studio.fonts || [],
      artworks: studio.artworks || [],
    });
    setEditId(studio.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return; // Should not happen
    if (!window.confirm('Are you sure you want to delete this studio and all related items?')) return;
    setLoading(true);
    try {
      // Deleting the studio will cascade delete related items if your DB is set up correctly.
      const { error } = await supabase.from('studios').delete().eq('id', id);
      if (error) throw error;
      toast.success('Studio deleted successfully');
      fetchStudios();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete studio');
    } finally {
      setLoading(false);
    }
  };

  const addFontItem = () => {
    setFormData(prev => ({
      ...prev,
      fonts: [
        ...prev.fonts,
        { name: '', image: '', type: '', price: 0 },
      ],
    }));
  };

  const updateFontItem = (index: number, field: keyof FontItem, value: string | number) => {
    const updatedFonts = [...formData.fonts];
    updatedFonts[index][field] = value as never; // Use type assertion
    setFormData(prev => ({ ...prev, fonts: updatedFonts }));
  };

  const removeFontItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fonts: prev.fonts.filter((_, i) => i !== index),
    }));
  };

  const addArtworkItem = () => {
    setFormData(prev => ({
      ...prev,
      artworks: [
        ...prev.artworks,
        { name: '', author: '', image: '', type: '' },
      ],
    }));
  };

  const updateArtworkItem = (index: number, field: keyof ArtworkItem, value: string) => {
    const updatedArtworks = [...formData.artworks];
    updatedArtworks[index][field] = value;
    setFormData(prev => ({ ...prev, artworks: updatedArtworks }));
  };

  const removeArtworkItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      artworks: prev.artworks.filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout_admin>
      <div className="space-y-10">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Manage Studios</h1>
        {!showForm && !editId && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            + Add New Studio
          </button>
        )}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <table className="min-w-full bg-white border rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Name</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Description</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Thumbnail</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Author</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Slogan</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Fonts</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Artworks</th>
                    <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studios.map((studio) => (
                    <tr key={studio.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4 border-b">{studio.name}</td>
                      <td className="py-2 px-4 border-b">{studio.description}</td>
                      <td className="py-2 px-4 border-b">
                        {studio.thumbnail && (
                          <MediaPreview url={studio.thumbnail} />
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {studio.author
                          ? studio.author.split('/').map((line, idx) => (
                              <div key={idx}>{line.trim()}</div>
                            ))
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-4 border-b">{studio.slogan || 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{studio.fonts ? studio.fonts.length : 0} items</td>
                      <td className="py-2 px-4 border-b">{studio.artworks ? studio.artworks.length : 0} items</td>
                      <td className="py-2 px-4 border-b">
                        <button onClick={() => handleEdit(studio)} className="mr-2 text-blue-600 hover:underline font-semibold">Edit</button>
                        <button onClick={() => handleDelete(studio.id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(showForm || editId) && (
              <div className="bg-white rounded-xl shadow p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-700">{editId ? 'Edit Studio' : 'Add New Studio'}</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left column */}
                    <div className="space-y-4">
                      <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-200" required />
                      <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value.replace(/\//g, '\n') })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" required />
                      <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                          Thumbnail Image/Video
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <input
                            type="file"
                            id="thumbnail"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                            onChange={(e) => handleImageChange(e, 'thumbnail')}
                            className="hidden"
                          />
                          <label
                            htmlFor="thumbnail"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Choose File
                          </label>
                          {formData.thumbnail && (
                            <div className="relative">
                              <MediaPreview url={formData.thumbnail} />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 focus:outline-none"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {formData.thumbnail && (
                          <p className="mt-2 text-sm text-gray-500">
                            Current file: {formData.thumbnail.split('/').pop()}
                          </p>
                        )}
                      </div>
                      <input type="text" placeholder="Logo URL (image only)" value={formData.logo} onChange={e => setFormData(prev => ({ ...prev, logo: e.target.value }))} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                      <div className="flex gap-2 mt-2">
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await handleUpload(file);
                          if (url) setFormData(prev => ({ ...prev, logo: url }));
                        }} className="border p-2 w-full rounded-lg" />
                      </div>
                      {formData.logo && (
                        <img src={formData.logo} alt="Logo Preview" className="w-24 h-24 object-contain bg-white mt-2 border rounded-lg" />
                      )}
                    </div>
                    {/* Right column */}
                    <div className="space-y-4">
                      <input type="text" placeholder="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-200" />
                      <input type="text" placeholder="Slogan" value={formData.slogan} onChange={(e) => setFormData({ ...formData, slogan: e.target.value })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                      <input type="text" placeholder="Image Title" value={formData.imageTitle} onChange={(e) => setFormData({ ...formData, imageTitle: e.target.value })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                      <textarea placeholder="Image Description" value={formData.imageDescription} onChange={(e) => setFormData({ ...formData, imageDescription: e.target.value })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                      <input type="text" placeholder="Open Days (e.g. Mon,Tue,Wed)" value={formData.openDays} onChange={e => setFormData({ ...formData, openDays: e.target.value })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                      <input type="text" placeholder="Open Hours (e.g. 9:00-17:00)" value={formData.openHours} onChange={e => setFormData({ ...formData, openHours: e.target.value })} className="border p-3 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-200" />
                    </div>
                  </div>
                  {/* Font Items */}
                  <div className="mt-6 bg-gray-50 shadow-inner rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Font Items</h3>
                    <div className="space-y-4">
                      {formData.fonts.map((item, index) => (
                        <div key={index} className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-md border border-gray-200">
                          <input type="text" placeholder="Name" value={item.name} onChange={(e) => updateFontItem(index, 'name', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="text" placeholder="Image URL" value={item.image} onChange={(e) => updateFontItem(index, 'image', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="file" onChange={(e) => handleItemImageChange(e, index, 'fonts')} className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200" />
                          <input type="text" placeholder="Type" value={item.type} onChange={(e) => updateFontItem(index, 'type', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateFontItem(index, 'price', Number(e.target.value))} className="border border-gray-300 p-2 rounded w-24 focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <button onClick={() => removeFontItem(index)} className="text-red-600 hover:text-red-800 font-medium">Remove</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addFontItem(); }} className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">+ Add Font Item</button>
                  </div>
                  {/* Artwork Items */}
                  <div className="mt-6 bg-gray-50 shadow-inner rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Artwork Items</h3>
                    <div className="space-y-4">
                      {formData.artworks.map((item, index) => (
                        <div key={index} className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-md border border-gray-200">
                          <input type="text" placeholder="Name" value={item.name} onChange={(e) => updateArtworkItem(index, 'name', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="text" placeholder="Author" value={item.author} onChange={(e) => updateArtworkItem(index, 'author', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="text" placeholder="Image URL" value={item.image} onChange={(e) => updateArtworkItem(index, 'image', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <input type="file" onChange={(e) => handleItemImageChange(e, index, 'artworks')} className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200" />
                          <input type="text" placeholder="Type" value={item.type} onChange={(e) => updateArtworkItem(index, 'type', e.target.value)} className="border border-gray-300 p-2 rounded flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                          <button onClick={() => removeArtworkItem(index)} className="text-red-600 hover:text-red-800 font-medium">Remove</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addArtworkItem(); }} className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">+ Add Artwork Item</button>
                  </div>
                  {/* Navigation Items */}
                  <div className="mt-6 bg-gray-50 shadow-inner rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Navigation Items</h3>
                    {formData.navigation.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input type="text" placeholder="Label" value={item.label} onChange={e => {
                          const updated = [...formData.navigation];
                          updated[idx].label = e.target.value;
                          setFormData(prev => ({ ...prev, navigation: updated }));
                        }} className="border p-2 rounded" />
                        <input type="text" placeholder="Href" value={item.href} onChange={e => {
                          const updated = [...formData.navigation];
                          updated[idx].href = e.target.value;
                          setFormData(prev => ({ ...prev, navigation: updated }));
                        }} className="border p-2 rounded" />
                        <button type="button" onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            navigation: prev.navigation.filter((_, i) => i !== idx)
                          }));
                        }} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setFormData(prev => ({
                      ...prev,
                      navigation: [...prev.navigation, { label: '', href: '' }]
                    }))} className="text-blue-500">+ Add Navigation Item</button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditId(null); setFormData({ name: '', description: '', thumbnail: '', logo: '', author: '', imageTitle: '', imageDescription: '', openDays: '', openHours: '', navigation: [], slogan: '', fonts: [], artworks: [], }); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      disabled={loading}
                    >
                      {editId ? 'Update Studio' : 'Create Studio'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </Layout_admin>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data: studios, error } = await supabase
      .from('studios')
      .select(`*, fonts(*), artworks(*)`);

    if (error) {
      throw error;
    }

    return {
      props: {
        initialStudios: studios || [],
      },
    };
  } catch (error: any) {
    return {
      props: {
        initialStudios: [],
        error: error.message,
      },
    };
  }
};

export default withAuth(AdminStudios);