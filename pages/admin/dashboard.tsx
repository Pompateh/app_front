import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout'
import { withAuth } from '../../components/withAuth'

interface DashboardStats {
  totalStudios: number;
  totalProjects: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: any[];
  recentProjects: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const apiUrl = 'https://app-back-gc64.onrender.com';
        console.log('Fetching dashboard data from:', `${apiUrl}/api/admin/dashboard`);
        
        const response = await fetch(`${apiUrl}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Origin': 'https://wearenewstalgia.com'
          },
          credentials: 'include'
        });

        console.log('Dashboard response status:', response.status);
        console.log('Dashboard response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Dashboard error response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        console.log('Dashboard data received:', data);
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {stats?.recentOrders?.map((order: any) => (
                <div key={order._id} className="border-b pb-4">
                  <p className="font-semibold">Order #{order._id}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
            <div className="space-y-4">
              {stats?.recentProjects?.map((project: any) => (
                <div key={project._id} className="border-b pb-4">
                  <div className="flex items-center space-x-4">
                    {project.thumbnail && (
                      <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{project.title}</p>
                      <p className="text-sm text-gray-600">{project.studio?.name}</p>
                      <p className="text-sm">Status: <span className="font-medium">{project.status}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
