import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { withAuth } from '../../components/withAuth'

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribers')
      const data = await res.json()
      setSubscribers(data)
    } catch (err) {
      setError('Failed to load subscribers')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return
    try {
      await fetch(`/api/newsletter/unsubscribe/${id}`, { method: 'DELETE' })
      await fetchSubscribers()
    } catch (err) {
      setError('Failed to delete subscriber')
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Manage Newsletter Subscriptions</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Subscribed At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td className="py-2 px-4 border-b">{subscriber.email}</td>
                <td className="py-2 px-4 border-b">{new Date(subscriber.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleDelete(subscriber.id)} className="text-red-500">
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

export default withAuth(AdminNewsletter)
