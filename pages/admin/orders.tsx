import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { withAuth } from '../../components/withAuth'

interface Order {
  id: string;
  orderRef: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      setError('Failed to load orders')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      await fetchOrders()
    } catch (err) {
      setError('Failed to delete order')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order Ref</th>
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Total</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-2 px-4 border-b">{order.orderRef}</td>
                <td className="py-2 px-4 border-b">{order.userId}</td>
                <td className="py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{order.status}</td>
                <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleDelete(order.id)} className="text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  )
}

export default withAuth(AdminOrders)
