import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout_admin from '../../components/Layout_admin';

interface NavItem {
  label: string;
  href: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  type: string;
  year: number;
}

interface FontItem {
  id: string;
  name: string;
  image: string;
  type: string;
  price: number;
}

interface ArtworkItem {
  id: string;
  name: string;
  author: string;
  image: string;
  type: string;
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
  portfolio?: PortfolioItem[];
  fonts?: FontItem[];
  artworks?: ArtworkItem[];
}

const AdminStudios = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
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
    portfolio: PortfolioItem[];
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
    portfolio: [],
    fonts: [],
    artworks: [],
  });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchStudios = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('No token found, user is not authenticated');
      toast.error('You are not authenticated. Please log in.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/studios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorRes = await response.json();
        console.error('Failed to fetch studios:', errorRes);
        toast.error(errorRes.message || 'Failed to fetch studios');
        return;
      }

      const data = await response.json();
      console.log('Studios data:', data);
      setStudios(data);
    } catch (error) {
      console.error('Error fetching studios:', error);
      toast.error('Error fetching studios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
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

    try {
      const sanitizedOpenDays = formData.openDays
        .split(',')
        .map((day) => day.trim())
        .filter((day) => day);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/api/studios/${editId}` : `/api/studios`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          openDays: sanitizedOpenDays,
          navigation: formData.navigation,
        }),
      });

      if (!response.ok) {
        let errorText = 'Failed to save studio';
        try {
          const errorData = await response.json();
          console.error('Server response:', errorData);
          if (typeof errorData === 'string') {
            errorText = errorData;
          } else if (errorData && typeof errorData.message === 'string') {
            errorText = errorData.message;
          } else {
            errorText = JSON.stringify(errorData);
          }
        } catch (jsonErr) {
          errorText = 'Failed to parse error response';
        }
        throw new Error(errorText);
      }

      await fetchStudios();

      setFormData({
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
        portfolio: [],
        fonts: [],
        artworks: [],
      });
      setEditId(null);
      toast.success(editId ? 'Studio updated successfully' : 'Studio added successfully');
    } catch (err) {
      console.error('Error saving studio:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to save studio');
    }
  };

  const handleItemImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number,
  itemType: 'portfolio' | 'fonts' | 'artworks'
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
      portfolio: studio.portfolio || [],
      fonts: studio.fonts || [],
      artworks: studio.artworks || [],
    });
    setEditId(studio.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this studio?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/studios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete studio');
      await fetchStudios();
    } catch (err) {
      setError('Failed to delete studio');
      toast.error('Failed to delete studio');
    }
  };

  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { id: '', title: '', image: '', type: '', year: new Date().getFullYear() }],
    }));
  };

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    const updatedPortfolio = [...formData.portfolio];
    updatedPortfolio[index][field] = value as never; // Use type assertion
    setFormData(prev => ({ ...prev, portfolio: updatedPortfolio }));
  };

  const removePortfolioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  const addFontItem = () => {
    setFormData(prev => ({
      ...prev,
      fonts: [...prev.fonts, { id: '', name: '', image: '', type: '', price: 0 }],
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
      artworks: [...prev.artworks, { id: '', name: '', author: '', image: '', type: '' }],
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
      <h1 className="text-2xl font-bold mb-4">Manage Studios</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Thumbnail</th>
                <th className="py-2 px-4 border-b">Author</th>
                <th className="py-2 px-4 border-b">Slogan</th>
                <th className="py-2 px-4 border-b">Portfolio</th>
                <th className="py-2 px-4 border-b">Fonts</th>
                <th className="py-2 px-4 border-b">Artworks</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studios.map((studio) => (
                <tr key={studio.id}>
                  <td className="py-2 px-4 border-b">{studio.name}</td>
                  <td className="py-2 px-4 border-b">{studio.description}</td>
                  <td className="py-2 px-4 border-b">
                    {studio.thumbnail ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}${studio.thumbnail}`} alt={studio.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      'No Thumbnail'
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
                  <td className="py-2 px-4 border-b">{studio.portfolio ? studio.portfolio.length : 0} items</td>
                  <td className="py-2 px-4 border-b">{studio.fonts ? studio.fonts.length : 0} items</td>
                  <td className="py-2 px-4 border-b">{studio.artworks ? studio.artworks.length : 0} items</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleEdit(studio)} className="mr-2 text-blue-500">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(studio.id)} className="text-red-500">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-8 text-xl font-semibold">{editId ? 'Edit Studio' : 'Add New Studio'}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border p-2 w-full rounded"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value.replace(/\//g, '\n') })}
                  className="border p-2 w-full rounded mt-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Thumbnail URL (image, gif, or mp4)"
                  value={formData.thumbnail}
                  onChange={e => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="border p-2 w-full rounded mt-2"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={(e) => handleImageChange(e, 'thumbnail')}
                    className="border p-2 w-full rounded"
                  />
                </div>
                {formData.thumbnail && (
                  formData.thumbnail.match(/\.mp4$/i) ? (
                    <video
                      src={formData.thumbnail}
                      className="w-32 h-32 object-cover mt-2"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    />
                  ) : (
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail"
                      className="w-32 h-32 object-cover mt-2"
                    />
                  )
                )}
                <input
                  type="text"
                  placeholder="Logo URL (image only)"
                  value={formData.logo}
                  onChange={e => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  className="border p-2 w-full rounded mt-2"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleUpload(file);
                      if (url) setFormData(prev => ({ ...prev, logo: url }));
                    }}
                    className="border p-2 w-full rounded"
                  />
                </div>
                {formData.logo && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${formData.logo}`}
                    alt="Logo Preview"
                    className="w-24 h-24 object-contain bg-white mt-2 border"
                  />
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="border p-2 w-full rounded"
                />
                <input
                  type="text"
                  placeholder="Image Title"
                  value={formData.imageTitle}
                  onChange={(e) => setFormData({ ...formData, imageTitle: e.target.value })}
                  className="border p-2 w-full rounded mt-2"
                />
                <textarea
                  placeholder="Image Description"
                  value={formData.imageDescription}
                  onChange={(e) => setFormData({ ...formData, imageDescription: e.target.value })}
                  className="border p-2 w-full rounded mt-2"
                />
                <input
                  type="text"
                  placeholder="Open Days (e.g. Mon,Tue,Wed)"
                  value={formData.openDays}
                  onChange={e => setFormData({ ...formData, openDays: e.target.value })}
                  className="border p-2 w-full rounded mt-2"
                />
                <input
                  type="text"
                  placeholder="Open Hours (e.g. 9:00-17:00)"
                  value={formData.openHours}
                  onChange={e => setFormData({ ...formData, openHours: e.target.value })}
                  className="border p-2 w-full rounded mt-2"
                />
              </div>
            </div>

// Portfolio Items
<div className="mt-6 bg-white shadow-lg rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Portfolio Items</h3>
  <div className="space-y-4">
    {formData.portfolio.map((item, index) => (
      <div key={index} className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-md">
        <input
          type="text"
          placeholder="Title"
          value={item.title}
          onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={item.image}
          onChange={(e) => updatePortfolioItem(index, 'image', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="file"
          onChange={(e) => handleItemImageChange(e, index, 'portfolio')}
          className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="text"
          placeholder="Type"
          value={item.type}
          onChange={(e) => updatePortfolioItem(index, 'type', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Year"
          value={item.year}
          onChange={(e) => updatePortfolioItem(index, 'year', Number(e.target.value))}
          className="border border-gray-300 p-2 rounded w-24 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <button
          onClick={() => removePortfolioItem(index)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
  <button
    onClick={(e) => { e.preventDefault(); addPortfolioItem(); }}
    className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
  >
    + Add Portfolio Item
  </button>
</div>

// Font Items
<div className="mt-6 bg-white shadow-lg rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Font Items</h3>
  <div className="space-y-4">
    {formData.fonts.map((item, index) => (
      <div key={index} className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-md">
        <input
          type="text"
          placeholder="Name"
          value={item.name}
          onChange={(e) => updateFontItem(index, 'name', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={item.image}
          onChange={(e) => updateFontItem(index, 'image', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="file"
          onChange={(e) => handleItemImageChange(e, index, 'fonts')}
          className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="text"
          placeholder="Type"
          value={item.type}
          onChange={(e) => updateFontItem(index, 'type', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Price"
          value={item.price}
          onChange={(e) => updateFontItem(index, 'price', Number(e.target.value))}
          className="border border-gray-300 p-2 rounded w-24 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <button
          onClick={() => removeFontItem(index)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
  <button
    onClick={(e) => { e.preventDefault(); addFontItem(); }}
    className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
  >
    + Add Font Item
  </button>
</div>

// Artwork Items
<div className="mt-6 bg-white shadow-lg rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Artwork Items</h3>
  <div className="space-y-4">
    {formData.artworks.map((item, index) => (
      <div key={index} className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-md">
        <input
          type="text"
          placeholder="Name"
          value={item.name}
          onChange={(e) => updateArtworkItem(index, 'name', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Author"
          value={item.author}
          onChange={(e) => updateArtworkItem(index, 'author', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={item.image}
          onChange={(e) => updateArtworkItem(index, 'image', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <input
          type="file"
          onChange={(e) => handleItemImageChange(e, index, 'artworks')}
          className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="text"
          placeholder="Type"
          value={item.type}
          onChange={(e) => updateArtworkItem(index, 'type', e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <button
          onClick={() => removeArtworkItem(index)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
  <button
    onClick={(e) => { e.preventDefault(); addArtworkItem(); }}
    className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
  >
    + Add Artwork Item
  </button>
</div>

// Navigation Items
<div className="mt-6 bg-white shadow-lg rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Navigation Items</h3>
  {formData.navigation.map((item, idx) => (
    <div key={idx} className="flex gap-2 mb-2">
      <input
        type="text"
        placeholder="Label"
        value={item.label}
        onChange={e => {
          const updated = [...formData.navigation];
          updated[idx].label = e.target.value;
          setFormData(prev => ({ ...prev, navigation: updated }));
        }}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Href"
        value={item.href}
        onChange={e => {
          const updated = [...formData.navigation];
          updated[idx].href = e.target.value;
          setFormData(prev => ({ ...prev, navigation: updated }));
        }}
        className="border p-2 rounded"
      />
      <button
        type="button"
        onClick={() => {
          setFormData(prev => ({
            ...prev,
            navigation: prev.navigation.filter((_, i) => i !== idx)
          }));
        }}
        className="text-red-500"
      >
        Remove
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() => setFormData(prev => ({
      ...prev,
      navigation: [...prev.navigation, { label: '', href: '' }]
    }))}
    className="text-blue-500"
  >
    + Add Navigation Item
  </button>
</div>

            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              {editId ? 'Update Studio' : 'Add Studio'}
            </button>
          </form>
        </>
      )}
    </Layout_admin>
  );
};

export default withAuth(AdminStudios);