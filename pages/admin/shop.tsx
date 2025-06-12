import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { withAuth } from '../../components/withAuth'

interface ShopProduct {
  id: string;
  productId: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

const AdminShop = () => {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState<{ productId: string; title: string; description: string; price: number; image: string }>({
    productId: '',
    title: '',
    description: '',
    price: 0,
    image: '',
  })
  const [editId, setEditId] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shop/products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const endpoint = editId ? `/api/shop/products/${editId}` : '/api/shop/products'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Operation failed')
      await fetchProducts()
      setFormData({ productId: '', title: '', description: '', price: 0, image: '' })
      setEditId(null)
    } catch (err) {
      setError('Failed to save product')
    }
  }

  const handleEdit = (product: ShopProduct) => {
    setFormData({ productId: product.productId, title: product.title, description: product.description, price: product.price, image: product.image })
    setEditId(product.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await fetch(`/api/shop/products/${id}`, { method: 'DELETE' })
      await fetchProducts()
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Manage Shop Products</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border-b">{product.title}</td>
                  <td className="py-2 px-4 border-b">{product.description}</td>
                  <td className="py-2 px-4 border-b">${product.price.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">
                    <img src={product.image} alt={product.title} className="w-16 h-16 object-cover" />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleEdit(product)} className="mr-2 text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-8 text-xl font-semibold">{editId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              placeholder="Product ID"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              {editId ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </>
      )}
    </Layout>
  )
}

export default withAuth(AdminShop)
