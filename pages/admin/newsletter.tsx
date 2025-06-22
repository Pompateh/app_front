import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { withAuth } from '../../components/withAuth'
import { GetServerSideProps } from 'next'
import { supabase } from '../../lib/supabaseClient'

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface AdminNewsletterProps {
  initialSubscribers: Subscriber[];
  error?: string;
}

const AdminNewsletter: React.FC<AdminNewsletterProps> = ({ initialSubscribers, error: initialError }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(initialError)

  const fetchSubscribers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    if (error) {
      setError('Failed to load subscribers')
    } else {
      setSubscribers(data as Subscriber[])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return
    try {
      await supabase.from('subscribers').delete().eq('id', id)
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    if (error) {
      throw new Error('Failed to fetch subscribers')
    }
    return {
      props: { initialSubscribers: data || [] },
    }
  } catch (err) {
    return {
      props: { initialSubscribers: [], error: 'Failed to fetch subscribers' },
    }
  }
}

export default withAuth(AdminNewsletter)
