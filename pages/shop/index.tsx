import Layout from '../../components/Layout'
import { motion } from 'framer-motion'
import type { NextPage } from 'next'
import useSWR from 'swr'

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const Shop: NextPage = () => {
  // Assuming your API proxy is configured to forward /api/* calls to your NestJS API
  const { data: products, error } = useSWR<Product[]>('/api/shop/products', fetcher)

  if (error) return <div>Failed to load products.</div>
  if (!products) return <div>Loading products...</div>

  return (
    <Layout>
      <motion.section
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold mb-8">Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow-md">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h2 className="text-2xl font-semibold">{product.title}</h2>
              <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="mb-4">{product.description}</p>
              <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </Layout>
  )
}

export default Shop
