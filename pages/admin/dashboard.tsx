import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout'
import { withAuth } from '../../components/withAuth'
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface DashboardStats {
  totalStudios: number;
  totalProjects: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: any[];
  recentProjects: any[];
}

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          await router.replace('/admin/login');
          return;
        }

        console.log('Fetching dashboard data...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com';
        const response = await fetch(`${apiUrl}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        console.log('Dashboard response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            console.log('Session expired, redirecting to login');
            localStorage.removeItem('token');
            await router.replace('/admin/login');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        console.log('Dashboard data received:', data);
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        toast.error(err.message);
        
        if (err.message.includes('Session expired')) {
          localStorage.removeItem('token');
          await router.replace('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => router.replace('/admin/login')}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Return to Login
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Studios</h3>
            <p className="text-3xl font-bold">{stats?.totalStudios || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Projects</h3>
            <p className="text-3xl font-bold">{stats?.totalProjects || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
            <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {stats?.recentOrders?.length ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="border-b pb-2">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent orders</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
            {stats?.recentProjects?.length ? (
              <div className="space-y-4">
                {stats.recentProjects.map((project: any) => (
                  <div key={project.id} className="border-b pb-2">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600">{project.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent projects</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAuth(AdminDashboard);

export async function getServerSideProps() {
  return { props: {} }
}
