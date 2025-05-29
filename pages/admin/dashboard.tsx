import AdminLayout from '../../components/AdminLayout'
import { withAuth } from '../../components/withAuth'

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your admin dashboard. Use the sidebar to navigate to different management sections.</p>
      {/* You can add additional dashboard components (statistics, notifications, etc.) here */}
    </AdminLayout>
  )
}

export default withAuth(AdminDashboard)
