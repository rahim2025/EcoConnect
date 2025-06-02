import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Users, 
  BarChart2, 
  Bell, 
  Shield, 
  User,
  PlusCircle, 
  Search,
  AlertCircle,
  Calendar,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';

// Admin Dashboard components
import AdminBadgeCreator from '../components/admin/AdminBadgeCreator';
import AdminUserManager from '../components/admin/AdminUserManager';
import AdminDashboardStats from '../components/admin/AdminDashboardStats';
import AdminAlertManager from '../components/admin/AdminAlertManager';
import AdminReportedPosts from '../components/admin/AdminReportedPosts';
import AdminEventManager from '../components/admin/AdminEventManager';
import AdminRewardManager from '../components/admin/AdminRewardManager';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authUser && !authUser.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate('/');
      return;
    }
    
    fetchDashboardStats();
  }, [authUser, navigate]);
    const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      
      // Provide more detailed error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to load admin dashboard data";
                          
      toast.error(errorMessage);
      
      // Create fallback stats object with zeros to prevent rendering errors
      setStats({
        stats: {
          totalUsers: 0,
          totalBadges: 0,
          totalUserBadges: 0,
          reportedPostsCount: 0,
          pendingReportsCount: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          rewardsCount: 0
        },
        topUsers: [],
        popularBadges: []
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Not admin or not logged in
  if (!authUser || !authUser.isAdmin) {
    return (
      <div className="min-h-screen bg-base-200 pt-20 pb-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-base-100 rounded-xl shadow-lg p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-error" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">You don't have permission to view this page. This area is restricted to administrators only.</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8" /> Admin Dashboard
          </h1>
          <p className="text-white/80 mt-2">
            Manage the eco-friendly platform, users, and badge system
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-base-300 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{authUser?.fullName}</div>
                    <div className="text-xs opacity-70">Administrator</div>
                  </div>
                </div>
              </div>
                <div className="p-2">
                <nav className="flex flex-col">
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <BarChart2 className="w-5 h-5" /> Dashboard Overview
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'reports' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('reports')}
                  >
                    <AlertTriangle className="w-5 h-5" /> Reported Posts
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'events' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('events')}
                  >
                    <Calendar className="w-5 h-5" /> Event Management
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'badges' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('badges')}
                  >
                    <Award className="w-5 h-5" /> Badge Management
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'rewards' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('rewards')}
                  >
                    <Gift className="w-5 h-5" /> Reward Management
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="w-5 h-5" /> User Management
                  </button>
                  
                  <button 
                    className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeTab === 'alerts' ? 'bg-primary text-white' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setActiveTab('alerts')}
                  >
                    <AlertCircle className="w-5 h-5" /> Send User Alerts
                  </button>
                </nav>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-base-100 rounded-xl shadow-lg p-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                </div>
              ) : (
                <>                  {activeTab === 'overview' && <AdminDashboardStats stats={stats} />}
                  {activeTab === 'reports' && <AdminReportedPosts />}
                  {activeTab === 'events' && <AdminEventManager />}
                  {activeTab === 'badges' && <AdminBadgeCreator onCreateSuccess={fetchDashboardStats} />}
                  {activeTab === 'rewards' && <AdminRewardManager />}
                  {activeTab === 'users' && <AdminUserManager />}
                  {activeTab === 'alerts' && <AdminAlertManager />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
