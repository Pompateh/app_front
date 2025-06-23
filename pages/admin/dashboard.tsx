import Layout_admin from '../../components/Layout_admin'
import { withAuth } from '../../components/withAuth'
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabaseClient';
import { GetServerSideProps } from 'next';

interface DashboardStats {
  totalStudios: number;
  totalProjects: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: any[];
  recentProjects: any[];
}

interface AdminDashboardProps {
  stats: DashboardStats | null;
  error?: string;
        }

const AdminDashboard = ({ stats, error }: AdminDashboardProps) => {
  if (error) {
    return (
      <Layout_admin>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </Layout_admin>
    );
  }

  return (
    <Layout_admin>
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
    </Layout_admin>
  );
};

export default withAuth(AdminDashboard);

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // These can run in parallel
    const [
      { count: totalStudios },
      { count: totalProjects },
      { count: totalOrders },
      { data: usersData, error: usersError },
      { data: recentOrders },
      { data: recentProjects },
    ] = await Promise.all([
      supabase.from('studios').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_total_users'),
      supabase.from('orders').select('id, customerName:customer_name, date:created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('projects').select('id, name:title, date:created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    if (usersError) throw usersError;

    const stats: DashboardStats = {
      totalStudios: totalStudios || 0,
      totalProjects: totalProjects || 0,
      totalOrders: totalOrders || 0,
      totalUsers: usersData || 0,
      recentOrders: recentOrders || [],
      recentProjects: recentProjects || [],
    };

    return {
      props: {
        stats,
      },
    };
  } catch (err: any) {
    console.error('Error fetching dashboard data from Supabase:', err);
    return {
      props: {
        stats: null,
        error: 'Failed to fetch dashboard data. Please check the connection and table names.',
      },
    };
  }
}
